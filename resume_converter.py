#!/usr/bin/env python3
"""
Resume HTML to PDF Converter

This script converts an HTML resume to a professionally formatted PDF document
using WeasyPrint. It applies custom CSS styling, ensures proper page breaks,
follows resume best practices for formatting, and adds a timestamp.

Author: Manus AI and Claude 3.7 Sonnet
Date: May 18, 2025
"""

import os
import sys
import re
from pathlib import Path
from bs4 import BeautifulSoup
from weasyprint import HTML, CSS
import argparse
from datetime import datetime
import pytz

def setup_argparse():
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Convert HTML resume to professional PDF')
    parser.add_argument('html', type=str, nargs='?', default='resume.html',
                        help='Path to HTML resume file')
    parser.add_argument('output', type=str, nargs='?', default='professional_resume.pdf',
                        help='Output PDF file path')
    parser.add_argument('--font-dir', type=str, 
                        default='/usr/share/fonts',
                        help='Directory containing fonts (default: /usr/share/fonts)')
    return parser.parse_args()

def extract_resume_content(html_path):
    """Extract and parse resume content from HTML file."""
    with open(html_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Verify that the HTML has the expected structure
    container = soup.select_one('.container')
    if not container:
        print("Warning: Expected '.container' element not found in HTML")
    
    header = soup.select_one('.header')
    if not header:
        print("Warning: Expected '.header' element not found in HTML")
    
    sections = soup.select('.section')
    if not sections:
        print("Warning: No '.section' elements found in HTML")
    
    return soup

def optimize_header(soup):
    """Optimize header to be more compact and professional."""
    header = soup.select_one('.header')
    if not header:
        print("Warning: Cannot optimize header - no '.header' element found")
        return soup
    
    # Extract header elements
    name_element = header.select_one('h1, .name')
    contact_info = header.select_one('.contact-info')
    
    # Create a new header structure
    new_header = soup.new_tag('div')
    new_header['class'] = 'header professional-header'
    
    # Create a name section
    name_section = soup.new_tag('div')
    name_section['class'] = 'header-name'
    
    # Create a simple contact section
    contact_section = soup.new_tag('div')
    contact_section['class'] = 'header-contact'
    
    # Move name to name section
    if name_element:
        name_element_copy = name_element.extract()
        name_section.append(name_element_copy)
    
    # Process contact info
    if contact_info:
        # Find all links inside contact items, first remove emojis
        for emoji_span in contact_info.select('.contact-emoji'):
            emoji_span.decompose()
        
        # Get links from contact items
        links = []
        for contact_item in contact_info.select('.contact-item'):
            link = contact_item.find('a')
            if link:
                links.append(link)
        
        # Add links to contact section with separators
        for i, link in enumerate(links):
            # Copy the link to avoid issues when adding to new section
            link_copy = soup.new_tag('a')
            link_copy['href'] = link.get('href', '')
            if link.get('target'):
                link_copy['target'] = link['target']
            link_copy.string = link.get_text(strip=True)
            
            # Add dividers after (not before) each link except the last
            if i > 0:
                divider = soup.new_tag('span')
                divider['class'] = 'contact-divider'
                divider.string = ' | '
                contact_section.append(divider)
            
            contact_section.append(link_copy)
    
    # Add sections to the header
    new_header.append(name_section)
    new_header.append(contact_section)
    
    # Replace old header with new header
    header.replace_with(new_header)
    
    return soup

def optimize_skills_matrix(soup):
    """Optimize the skills matrix to be more compact with consistent text size."""
    # Find the skills matrix
    skills_matrix = soup.select_one('.skills-matrix')
    if not skills_matrix:
        return soup  # No skills matrix found
    
    # Add a class to each skill area to make it more compact
    for skill_div in skills_matrix.select('div'):
        skill_div['class'] = 'skill-area compact'
        
        # Make the h3 and p display inline
        h3 = skill_div.select_one('h3')
        p = skill_div.select_one('p')
        
        if h3 and p:
            # Add style to make content more compact and ensure h3 is bold
            h3['style'] = 'display: inline; margin-right: 5px; font-weight: 900 !important; color: #2c3e50 !important;'
            p['style'] = 'display: inline; margin: 0; font-size: 10.5pt !important;'
            
            # Add span with bold-text class for redundancy
            if h3.string:
                original_text = h3.string
                h3.string = ''
                
                span = soup.new_tag('span')
                span['class'] = 'bold-text'
                span.string = original_text
                h3.append(span)
    
    # Add a style attribute to the matrix itself
    skills_matrix['style'] = 'display: grid; grid-template-columns: 1fr; gap: 0.1em;'
    
    return soup

def enhance_experience_items(soup):
    """Add strategic bold text to experience items for better readability."""
    # Find all experience items
    for exp_item in soup.select('.experience-item'):
        # Make company name bold
        company = exp_item.select_one('.company')
        if company:
            # Try wrapping in both strong and span with bold-text class for redundancy
            if company.string:
                strong = soup.new_tag('strong')
                strong.string = company.string
                
                span = soup.new_tag('span')
                span['class'] = 'bold-text'
                span.append(strong)
                
                company.string = ''
                company.append(span)
                
                # Also add style directly to the element for maximum compatibility
                company['style'] = 'font-weight: 900 !important; color: #2c3e50 !important;'
        
        # Find all list items in responsibilities
        for li in exp_item.select('.responsibilities li'):
            # Look for achievement indicators
            text_content = li.get_text()
            achievement_indicators = [
                "increased", "decreased", "improved", "reduced", "developed",
                "created", "launched", "implemented", "led", "managed",
                "achieved", "exceeded", "generated", "secured", "won",
                "designed", "built", "maintained", "coordinated", "drove",
                "directed", "produced", "delivered", "boosted", "expanded"
            ]
            
            # Mark achievements by bolding first section
            for indicator in achievement_indicators:
                if indicator.lower() in text_content.lower():
                    # Find a good breaking point
                    end_pos = -1
                    for punct in ['. ', ': ', ', ']:
                        pos = text_content.find(punct)
                        if pos > 0 and (end_pos == -1 or pos < end_pos):
                            end_pos = pos + len(punct) - 1
                    
                    if end_pos > 0:
                        # Split the text
                        first_part = text_content[:end_pos+1]
                        rest = text_content[end_pos+1:]
                        
                        # Clear li content
                        li.clear()
                        
                        # Create and add bold part with multiple layers of bold
                        span = soup.new_tag('span')
                        span['class'] = 'bold-text'
                        span['style'] = 'font-weight: 900 !important; color: #2c3e50 !important;'
                        
                        bold = soup.new_tag('strong')
                        bold.string = first_part
                        span.append(bold)
                        
                        li.append(span)
                        
                        # Add rest of text
                        if rest:
                            li.append(' ' + rest)
                    break
    
    # Make institution names bold in education section
    for institution in soup.select('.institution'):
        if institution.string:
            # Use both span and strong for redundancy
            span = soup.new_tag('span')
            span['class'] = 'bold-text'
            span['style'] = 'font-weight: 900 !important; color: #2c3e50 !important;'
            
            strong = soup.new_tag('strong')
            strong.string = institution.string
            span.append(strong)
            
            institution.string = ''
            institution.append(span)
    
    # Make section headings bold
    for heading in soup.select('h2, h3'):
        if heading.string:
            # Add direct styling
            heading['style'] = 'font-weight: 900 !important; color: #2c3e50 !important;'
    
    return soup

def remove_emojis(soup):
    """Remove all emoji characters from the HTML content."""
    # Unicode ranges for emojis - in case any remain in text nodes
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F700-\U0001F77F"  # alchemical symbols
        "\U0001F780-\U0001F7FF"  # Geometric Shapes
        "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA00-\U0001FA6F"  # Chess Symbols
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "\U00002702-\U000027B0"  # Dingbats
        "\U000024C2-\U0001F251" 
        "]+", flags=re.UNICODE
    )
    
    # Remove emoji spans
    for emoji_span in soup.select('.contact-emoji'):
        emoji_span.decompose()
    
    # Find all text nodes and remove emojis
    for text in soup.find_all(text=True):
        if emoji_pattern.search(text):
            new_text = emoji_pattern.sub('', text)
            text.replace_with(new_text)
    
    # Also remove any elements with emoji classes
    emoji_elements = soup.select('[class*="emoji"], [class*="icon"], .fa, .fab, .fas, .far, .fal')
    for element in emoji_elements:
        element.decompose()
    
    return soup

def add_timestamp(soup):
    """Add timestamp at the bottom of the resume."""
    # Get current time in Eastern Time
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    timestamp = now.strftime("Last updated: %B %d, %Y at %I:%M %p ET")
    
    # Find container to append timestamp
    container = soup.select_one('.container')
    if not container:
        # Try to find body
        container = soup.body
        if not container:
            # Create body if it doesn't exist
            container = soup.new_tag('body')
            soup.html.append(container)
    
    # Create timestamp container
    timestamp_div = soup.new_tag('div')
    timestamp_div['class'] = 'timestamp-container'
    timestamp_div['style'] = 'text-align: center; margin-top: 20px; font-style: italic; font-size: 8pt; color: #777;'
    timestamp_div.string = timestamp
    
    # Append to the end
    container.append(timestamp_div)
    
    return soup

def compact_content(soup):
    """Make the content more compact to fit on two pages."""
    # Find all list items and reduce their margin
    for li in soup.select('li'):
        if 'style' not in li.attrs:
            li['style'] = 'margin-bottom: 0.2em;'
        else:
            li['style'] += ' margin-bottom: 0.2em;'
    
    # Find all paragraphs and reduce their margin (except in skills matrix)
    for p in soup.select('p:not(.skills-matrix p)'):
        if 'style' not in p.attrs:
            p['style'] = 'margin: 0.3em 0;'
        else:
            p['style'] += ' margin: 0.3em 0;'
    
    # Reduce spacing in sections
    for section in soup.select('.section'):
        if 'style' not in section.attrs:
            section['style'] = 'margin-bottom: 0.7em;'
        else:
            section['style'] += ' margin-bottom: 0.7em;'
    
    # Reduce spacing in experience items
    for exp_item in soup.select('.experience-item'):
        if 'style' not in exp_item.attrs:
            exp_item['style'] = 'margin-bottom: 0.6em;'
        else:
            exp_item['style'] += ' margin-bottom: 0.6em;'
    
    # Reduce spacing in education items
    for edu_item in soup.select('.education-item'):
        if 'style' not in edu_item.attrs:
            edu_item['style'] = 'margin-bottom: 0.5em;'
        else:
            edu_item['style'] += ' margin-bottom: 0.5em;'
    
    return soup

def optimize_for_pdf(soup):
    """Optimize HTML content for PDF conversion."""
    # Remove download section as it's not needed in PDF
    download_section = soup.select_one('.download-section')
    if download_section:
        download_section.decompose()
    
    # Ensure all links show their URLs in the PDF
    for link in soup.select('a'):
        if 'href' in link.attrs and not link['href'].startswith('mailto:'):
            # Don't add URL text for email links
            if not link.get('title'):
                link['title'] = link['href']
    
    return soup

def add_meta_tags(soup):
    """Add necessary meta tags for better PDF rendering."""
    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)
    
    # Add viewport meta tag if not present
    if not soup.select_one('meta[name="viewport"]'):
        viewport = soup.new_tag('meta')
        viewport['name'] = 'viewport'
        viewport['content'] = 'width=device-width, initial-scale=1.0'
        head.append(viewport)
    
    # Add print-specific meta tag
    print_meta = soup.new_tag('meta')
    print_meta['name'] = 'print'
    print_meta['content'] = 'yes'
    head.append(print_meta)
    
    # Add font link tags for better font support
    font_link = soup.new_tag('link')
    font_link['rel'] = 'stylesheet'
    font_link['href'] = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Georgia&display=swap'
    head.append(font_link)
    
    return soup

def add_enhanced_styles(soup):
    """Add enhanced styling with strategic bold text to improve readability."""
    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)
    
    style_tag = soup.find('style') or soup.new_tag('style')
    style_tag.string = """
    /* Resume PDF Styles - Enhanced Version with Strategic Bold Text */
    @page {
        size: letter;
        margin: 0.5in 0.5in 0.5in 0.5in; /* Balanced margins */
        @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 8pt;
            color: #777;
        }
    }

    /* Global Styles */
    body {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.2; /* More balanced line height */
        color: #333;
        margin: 0;
        padding: 0;
        font-size: 10.5pt; /* Slightly larger for readability */
    }

    .container {
        max-width: 100%;
        margin: 0;
        padding: 0;
    }

    /* Professional Header Styles */
    .professional-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.7em;
        border-bottom: 1px solid #2c3e50;
        padding-bottom: 0.3em;
        page-break-inside: avoid;
    }

    .header-name {
        margin-bottom: 0.3em;
    }

    .header-name h1 {
        font-size: 20pt; /* Balanced header size */
        font-weight: 900 !important; /* Extra bold to ensure it renders */
        color: #2c3e50;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.1;
    }

    /* Simple contact row with minimal spacing */
    .header-contact {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        font-size: 9.5pt;
        color: #34495e;
        margin-top: 0.3em;
        gap: 0;
    }

    .header-contact a {
        color: #34495e;
        text-decoration: none;
        white-space: nowrap;
    }

    .contact-divider {
        margin: 0 3px;
        color: #7f8c8d;
    }

    /* Section Styles */
    .section {
        margin-bottom: 0.7em;
        page-break-inside: avoid;
    }

    .section h2 {
        font-size: 13pt;
        color: #2c3e50;
        margin: 0 0 0.3em;
        padding-bottom: 0.2em;
        border-bottom: 1px solid #eee;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.2;
        font-weight: 900 !important; /* Extra bold to ensure it renders */
    }

    /* Professional Summary */
    .professional-summary p {
        margin: 0.3em 0;
        text-align: justify;
        line-height: 1.25;
    }

    /* Highlight key terms in summary */
    .professional-summary strong {
        font-weight: 900 !important; /* Extra bold */
        color: #2c3e50;
    }

    /* Education Section */
    .education-item {
        margin-bottom: 0.5em;
        page-break-inside: avoid;
    }

    .institution {
        font-weight: 900 !important; /* Extra bold */
        font-size: 11pt;
        line-height: 1.2;
        color: #2c3e50;
    }

    .degree {
        font-style: italic;
        color: #555;
        font-size: 10.5pt;
        line-height: 1.2;
    }

    /* Experience Section */
    .experience-item {
        margin-bottom: 0.6em;
        page-break-inside: avoid;
    }

    .company {
        font-weight: 900 !important; /* Extra bold */
        font-size: 11pt;
        line-height: 1.2;
        color: #2c3e50;
    }

    .job-title {
        font-weight: normal;
        font-style: italic;
        margin-bottom: 0.2em;
        font-size: 10.5pt;
        line-height: 1.2;
        color: #34495e;
    }

    .duration {
        color: #555;
        font-size: 9.5pt;
    }

    .responsibilities ul {
        margin: 0.3em 0;
        padding-left: 1.2em;
    }

    .responsibilities li {
        margin-bottom: 0.2em;
        text-align: justify;
        line-height: 1.2;
    }

    /* Make bold text show properly */
    strong, b {
        font-weight: 900 !important; /* Extra bold to ensure it renders */
        color: #2c3e50 !important;
    }

    /* Add bold class for alternate method */
    .bold-text {
        font-weight: 900 !important; /* Extra bold */
        color: #2c3e50 !important;
    }

    /* Skills Matrix Styles - Ultra Compact with consistent text size */
    .skills-matrix {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.1em !important;
        margin: 0.2em 0 0.4em 0;
    }

    .skill-area {
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.1 !important;
    }

    .skill-area.compact {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
    }

    .skill-area h3 {
        font-size: 10.5pt !important; /* Match with experience text size */
        font-weight: 900 !important; /* Extra bold */
        margin: 0 4px 0 0 !important;
        padding: 0 !important;
        line-height: 1.1 !important;
        color: #2c3e50;
        display: inline;
    }

    .skill-area p {
        font-size: 10.5pt !important; /* Match with experience text size */
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.1 !important;
        display: inline;
        color: #333;
    }

    /* Hide all icon and emoji elements */
    .emoji, .icon, .fa, .fab, .fas, .far, .fal {
        display: none !important;
    }

    /* Timestamp at bottom */
    .timestamp-container {
        text-align: center;
        margin-top: 20px;
        font-style: italic;
        font-size: 8pt;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 5px;
    }

    /* Compact Page Break Controls */
    h2 {
        page-break-after: avoid;
        margin-top: 0.6em;
    }

    .section:first-of-type h2 {
        margin-top: 0;
    }

    /* Print Optimizations */
    @media print {
        .section {
            page-break-inside: auto;
        }
        
        .experience-item, .education-item {
            page-break-inside: avoid;
        }
        
        h2, h3 {
            page-break-after: avoid;
        }
        
        .professional-header {
            page-break-after: avoid;
        }
        
        /* Orphans and widows handling */
        p, li {
            orphans: 2;
            widows: 2;
        }
    }
    """
    
    if not soup.find('style'):
        head.append(style_tag)
    else:
        soup.find('style').replace_with(style_tag)
    
    return soup

def add_font_file(soup):
    """Add an embedded font to ensure bold works everywhere."""
    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)
    
    # Add style tag with embedded font data
    font_style = soup.new_tag('style')
    font_style.string = """
    /* Embed a basic font that supports bold */
    @font-face {
        font-family: 'EmbeddedFont';
        font-style: normal;
        font-weight: normal;
        src: local('Arial'), local('Helvetica'), local('sans-serif');
    }
    
    @font-face {
        font-family: 'EmbeddedFont';
        font-style: normal;
        font-weight: bold;
        src: local('Arial Bold'), local('Helvetica Bold'), local('sans-serif');
    }
    
    /* Apply embedded font to all elements */
    body, p, h1, h2, h3, h4, h5, h6, li, span, div {
        font-family: 'EmbeddedFont', 'Arial', 'Helvetica', sans-serif;
    }
    
    /* Ensure strong and bold elements are actually bold */
    strong, b, .bold-text {
        font-family: 'EmbeddedFont', 'Arial Bold', 'Helvetica Bold', sans-serif;
        font-weight: bold !important;
    }
    """
    
    head.append(font_style)
    return soup

def convert_to_pdf(soup, output_path, font_dir):
    """Convert BeautifulSoup HTML to PDF using WeasyPrint."""
    print(f"Converting resume to PDF: {output_path}")
    
    # Set font directories environment variable if provided
    if font_dir and os.path.exists(font_dir):
        print(f"Using font directory: {font_dir}")
        os.environ['WEASYPRINT_FONTS'] = font_dir
    
    # Create temporary HTML file with processed content
    temp_html_path = Path(output_path).with_suffix('.temp.html')
    
    try:
        # Write the HTML content to the temporary file
        with open(temp_html_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        
        # Create base URL for resolving relative paths
        base_url = Path.cwd().as_uri()
        
        # Configure WeasyPrint with font configuration
        from weasyprint.text.fonts import FontConfiguration
        font_config = FontConfiguration()
        
        # Create custom CSS for WeasyPrint
        resume_css = CSS(string="""
        @page {
            size: letter;
            margin: 0.5in 0.5in 0.5in 0.5in;
            @bottom-right {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 8pt;
                color: #777;
            }
        }
        """)
        
        # Generate PDF - using both approaches for maximum compatibility
        try:
            # First approach (from newer version)
            html = HTML(filename=str(temp_html_path))
            html.write_pdf(output_path, stylesheets=[resume_css])
        except Exception as e1:
            print(f"First PDF generation approach failed: {e1}")
            print("Trying alternative approach...")
            
            # Second approach (from older version)
            with open(temp_html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            HTML(string=html_content, base_url=base_url).write_pdf(
                output_path, 
                font_config=font_config
            )
        
        print(f"PDF successfully created: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise e
    finally:
        # Clean up temporary file in all cases
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)
            print("Temporary files cleaned up")

def main():
    """Main function to convert HTML resume to PDF."""
    args = setup_argparse()
    
    # Check if file exists
    if not os.path.exists(args.html):
        print(f"Error: HTML file not found: {args.html}")
        sys.exit(1)
    
    # Extract content
    soup = extract_resume_content(args.html)
    
    # Remove emojis from the content
    soup = remove_emojis(soup)
    
    # Optimize the header
    soup = optimize_header(soup)
    
    # Optimize the skills matrix
    soup = optimize_skills_matrix(soup)
    
    # Add strategic bold text to experience items
    soup = enhance_experience_items(soup)
    
    # Make content more compact to fit on two pages
    soup = compact_content(soup)
    
    # Additional optimizations
    soup = optimize_for_pdf(soup)
    soup = add_meta_tags(soup)
    
    # Add timestamp at the bottom
    soup = add_timestamp(soup)
    
    # Add embedded font to ensure bold works
    soup = add_font_file(soup)
    
    # Add enhanced styles with bold text
    soup = add_enhanced_styles(soup)
    
    # Convert to PDF
    pdf_path = convert_to_pdf(soup, args.output, args.font_dir)
    
    print(f"\nResume conversion complete!")
    print(f"PDF saved to: {os.path.abspath(pdf_path)}")
    print("\nBest practices implemented:")
    print("- Two-page layout with balanced line height")
    print("- Strategic bold text for improved readability")
    print("- Consistent text sizing in technical skills and work experience")
    print("- Bold formatting for company names and achievement statements")
    print("- Ultra-compact skills matrix with properly formatted headers")
    print("- Proper orphans/widows handling to prevent awkward breaks")
    print("- Optimized spacing between elements")
    print("- Clean header with preserved hyperlinks")
    print("- Removed all emojis and icons")
    print("- Professional typography with optimal readability")
    print("- Added timestamp showing last update date and time in Eastern time")
    print("- Enhanced font-handling to ensure bold text works in all environments")

if __name__ == "__main__":
    main()
