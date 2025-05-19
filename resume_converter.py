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
    parser.add_argument('--align', type=str, choices=['left', 'justify'], default='left',
                        help='Text alignment style (default: left)')
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
            # Add style to make content more compact with moderate bold
            h3['style'] = 'display: inline; margin-right: 5px; font-weight: 600;'
            p['style'] = 'display: inline; margin: 0; font-size: 10.5pt;'
            
            # Replace with simpler bold text
            if h3.string:
                original_text = h3.string
                h3.string = ''
                
                strong = soup.new_tag('strong')
                strong.string = original_text
                h3.append(strong)
    
    # Add a style attribute to the matrix itself
    skills_matrix['style'] = 'display: grid; grid-template-columns: 1fr; gap: 0.2em;'
    
    return soup

def enhance_experience_items(soup):
    """Format experience items with clean, consistent styling."""
    # Find all experience items
    for exp_item in soup.select('.experience-item'):
        # Make company name bold (but not overly bold)
        company = exp_item.select_one('.company')
        if company and company.string:
            strong = soup.new_tag('strong')
            strong.string = company.string
            company.string = ''
            company.append(strong)
            
    # Make institution names bold in education section
    for institution in soup.select('.institution'):
        if institution.string:
            strong = soup.new_tag('strong')
            strong.string = institution.string
            institution.string = ''
            institution.append(strong)
    
    # Make section headings bold with consistent styling
    for heading in soup.select('h2, h3'):
        if heading.string:
            # Add direct styling with moderate bold
            heading['style'] = 'font-weight: 600; color: #2c3e50;'
    
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
            li['style'] = 'margin-bottom: 0.3em;'
        else:
            li['style'] += ' margin-bottom: 0.3em;'
    
    # Find all paragraphs and reduce their margin (except in skills matrix)
    for p in soup.select('p:not(.skills-matrix p)'):
        if 'style' not in p.attrs:
            p['style'] = 'margin: 0.4em 0;'
        else:
            p['style'] += ' margin: 0.4em 0;'
    
    # Reduce spacing in sections
    for section in soup.select('.section'):
        if 'style' not in section.attrs:
            section['style'] = 'margin-bottom: 0.8em;'
        else:
            section['style'] += ' margin-bottom: 0.8em;'
    
    # Reduce spacing in experience items
    for exp_item in soup.select('.experience-item'):
        if 'style' not in exp_item.attrs:
            exp_item['style'] = 'margin-bottom: 0.7em;'
        else:
            exp_item['style'] += ' margin-bottom: 0.7em;'
    
    # Reduce spacing in education items
    for edu_item in soup.select('.education-item'):
        if 'style' not in edu_item.attrs:
            edu_item['style'] = 'margin-bottom: 0.6em;'
        else:
            edu_item['style'] += ' margin-bottom: 0.6em;'
    
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
    
    # Add font link tags for better font support - prioritize system fonts
    font_link = soup.new_tag('link')
    font_link['rel'] = 'stylesheet'
    font_link['href'] = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap'
    head.append(font_link)
    
    return soup

def add_improved_styles(soup, text_align="left"):
    """Add improved styling with balanced typography and consistent spacing."""
    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)
    
    # Set the text alignment consistently
    text_align_value = text_align if text_align in ["left", "justify"] else "left"
    
    style_tag = soup.find('style') or soup.new_tag('style')
    style_tag.string = f"""
    /* Resume PDF Styles - Improved Typography Version */
    @page {{
        size: letter;
        margin: 0.6in 0.6in 0.6in 0.6in; /* Slightly increased margins for better readability */
        @bottom-right {{
            content: "Page " counter(page) " of " counter(pages);
            font-size: 8pt;
            color: #777;
            font-family: 'Roboto', 'Liberation Sans', Arial, sans-serif;
        }}
    }}

    /* Global Styles with improved font stack */
    body {{
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', Arial, sans-serif;
        line-height: 1.3; /* Improved line height for readability */
        color: #333;
        margin: 0;
        padding: 0;
        font-size: 10.5pt;
        text-align: {text_align_value};
    }}

    .container {{
        max-width: 100%;
        margin: 0;
        padding: 0;
    }}

    /* Professional Header Styles */
    .professional-header {{
        display: flex;
        flex-direction: column;
        margin-bottom: 1em;
        border-bottom: 1px solid #2c3e50;
        padding-bottom: 0.4em;
        page-break-inside: avoid;
    }}

    .header-name {{
        margin-bottom: 0.4em;
    }}

    .header-name h1 {{
        font-size: 18pt; /* Slightly smaller for better proportion */
        font-weight: 700; /* Standard bold weight */
        color: #2c3e50;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.1;
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', Arial, sans-serif;
        text-align: center;
    }}

    /* Simple contact row with improved spacing */
    .header-contact {{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        font-size: 9.5pt;
        color: #34495e;
        margin-top: 0.4em;
        gap: 0;
        text-align: center;
    }}

    .header-contact a {{
        color: #34495e;
        text-decoration: none;
        white-space: nowrap;
    }}

    .contact-divider {{
        margin: 0 5px; /* Slightly more spacing */
        color: #7f8c8d;
    }}

    /* Section Styles */
    .section {{
        margin-bottom: 0.9em;
        page-break-inside: avoid;
    }}

    .section h2 {{
        font-size: 13pt;
        color: #2c3e50;
        margin: 0 0 0.4em;
        padding-bottom: 0.2em;
        border-bottom: 1px solid #eee;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.2;
        font-weight: 600; /* More balanced bold */
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', Arial, sans-serif;
    }}

    /* Professional Summary */
    .professional-summary p {{
        margin: 0.4em 0;
        text-align: {text_align_value};
        line-height: 1.3;
    }}

    /* Highlight key terms in summary with moderate bold */
    .professional-summary strong {{
        font-weight: 600;
        color: #2c3e50;
    }}

    /* Education Section */
    .education-item {{
        margin-bottom: 0.6em;
        page-break-inside: avoid;
    }}

    .institution {{
        font-weight: 600; /* More balanced bold */
        font-size: 11pt;
        line-height: 1.3;
        color: #2c3e50;
    }}

    .degree {{
        font-style: italic;
        color: #555;
        font-size: 10.5pt;
        line-height: 1.3;
    }}

    /* Experience Section */
    .experience-item {{
        margin-bottom: 0.8em;
        page-break-inside: avoid;
    }}

    .company {{
        font-weight: 600; /* More balanced bold */
        font-size: 11pt;
        line-height: 1.3;
        color: #2c3e50;
    }}

    .job-title {{
        font-weight: normal;
        font-style: italic;
        margin-bottom: 0.3em;
        font-size: 10.5pt;
        line-height: 1.3;
        color: #34495e;
    }}

    .duration {{
        color: #555;
        font-size: 9.5pt;
    }}

    .responsibilities ul {{
        margin: 0.4em 0;
        padding-left: 1.3em;
    }}

    .responsibilities li {{
        margin-bottom: 0.3em;
        text-align: {text_align_value};
        line-height: 1.3;
    }}

    /* Normal bold text with system fonts */
    strong, b {{
        font-weight: 600; /* More balanced bold */
        color: #2c3e50;
        font-family: inherit;
    }}

    /* Skills Matrix Styles - Clean with consistent text size */
    .skills-matrix {{
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.2em;
        margin: 0.3em 0 0.5em 0;
    }}

    .skill-area {{
        margin: 0;
        padding: 0;
        line-height: 1.3;
    }}

    .skill-area.compact {{
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
    }}

    .skill-area h3 {{
        font-size: 10.5pt;
        font-weight: 600; /* More balanced bold */
        margin: 0 5px 0 0;
        padding: 0;
        line-height: 1.3;
        color: #2c3e50;
        display: inline;
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', Arial, sans-serif;
    }}

    .skill-area p {{
        font-size: 10.5pt;
        margin: 0;
        padding: 0;
        line-height: 1.3;
        display: inline;
        color: #333;
    }}

    /* Hide all icon and emoji elements */
    .emoji, .icon, .fa, .fab, .fas, .far, .fal {{
        display: none !important;
    }}

    /* Timestamp at bottom */
    .timestamp-container {{
        text-align: center;
        margin-top: 20px;
        font-style: italic;
        font-size: 8pt;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 5px;
    }}

    /* Page Break Controls with improved spacing */
    h2 {{
        page-break-after: avoid;
        margin-top: 0.8em;
    }}

    .section:first-of-type h2 {{
        margin-top: 0;
    }}

    /* Print Optimizations */
    @media print {{
        .section {{
            page-break-inside: auto;
        }}
        
        .experience-item, .education-item {{
            page-break-inside: avoid;
        }}
        
        h2, h3 {{
            page-break-after: avoid;
        }}
        
        .professional-header {{
            page-break-after: avoid;
        }}
        
        /* Orphans and widows handling */
        p, li {{
            orphans: 2;
            widows: 2;
        }}
    }}
    """
    
    if not soup.find('style'):
        head.append(style_tag)
    else:
        soup.find('style').replace_with(style_tag)
    
    return soup

def configure_fonts(soup):
    """Configure fonts with prioritization for installed system fonts."""
    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)
    
    # Add style tag with font configuration
    font_style = soup.new_tag('style')
    font_style.string = """
    /* System-first font configuration */
    /* This ensures we use available system fonts first */
    
    /* Define font fallbacks that prioritize installed fonts */
    body, p, div, span, li, td, a {
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', 'DejaVu Sans', Arial, Helvetica, sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6, .company, .institution, .header-name h1 {
        font-family: 'Roboto', 'Liberation Sans', 'Noto Sans', 'DejaVu Sans', Arial, Helvetica, sans-serif;
    }
    
    /* Ensure consistent bold weight */
    strong, b, h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
    }
    
    /* Fix for font inconsistencies */
    * {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
        
        # For debugging: print available fonts
        print("Available fonts in the system:")
        os.system("fc-list | grep -i 'liberation\|roboto\|noto\|dejavu' | sort")
    
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
            margin: 0.6in 0.6in 0.6in 0.6in;
            @bottom-right {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 8pt;
                color: #777;
                font-family: 'Roboto', 'Liberation Sans', Arial, sans-serif;
            }
        }
        """)
        
        # Generate PDF - using both approaches for maximum compatibility
        try:
            # First approach - direct from temporary file
            html = HTML(filename=str(temp_html_path), base_url=base_url)
            html.write_pdf(output_path, stylesheets=[resume_css], font_config=font_config)
            print("PDF generation successful using file-based approach")
        except Exception as e1:
            print(f"First PDF generation approach failed: {e1}")
            print("Trying alternative approach...")
            
            # Second approach - from string content
            with open(temp_html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            HTML(string=html_content, base_url=base_url).write_pdf(
                output_path, 
                font_config=font_config
            )
            print("PDF generation successful using string-based approach")
        
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
    
    print(f"Processing HTML resume: {args.html}")
    print(f"Using text alignment: {args.align}")
    
    # Extract content
    soup = extract_resume_content(args.html)
    
    # Remove emojis from the content
    soup = remove_emojis(soup)
    
    # Optimize the header
    soup = optimize_header(soup)
    
    # Optimize the skills matrix
    soup = optimize_skills_matrix(soup)
    
    # Enhance experience items (without bolding first parts)
    soup = enhance_experience_items(soup)
    
    # Make content more compact to fit on two pages
    soup = compact_content(soup)
    
    # Additional optimizations
    soup = optimize_for_pdf(soup)
    soup = add_meta_tags(soup)
    
    # Add timestamp at the bottom
    soup = add_timestamp(soup)
    
    # Configure fonts to use system fonts properly
    soup = configure_fonts(soup)
    
    # Add improved styles with balanced typography and consistent text alignment
    soup = add_improved_styles(soup, args.align)
    
    # Convert to PDF
    pdf_path = convert_to_pdf(soup, args.output, args.font_dir)
    
    print(f"\nResume conversion complete!")
    print(f"PDF saved to: {os.path.abspath(pdf_path)}")
    print("\nBest practices implemented:")
    print(f"- Consistent text alignment ({args.align})")
    print("- Balanced typography with system font prioritization")
    print("- Proper font weight consistency for headings and body text")
    print("- Improved spacing between elements for better readability")
    print("- Clean header with preserved hyperlinks")
    print("- Removed all emojis and icons")
    print("- Proper orphans/widows handling to prevent awkward breaks")
    print("- Content optimization for professional two-page layout")
    print("- Added timestamp showing last update date and time")
    print("- Enhanced compatibility with installed system fonts")

if __name__ == "__main__":
    main()