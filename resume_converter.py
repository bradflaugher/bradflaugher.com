#!/usr/bin/env python3
"""
Resume HTML to PDF Converter

This script converts an HTML resume to a professionally formatted PDF document
using WeasyPrint. It applies custom CSS styling, ensures proper page breaks,
and follows resume best practices for formatting.

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
    """Optimize the skills matrix to be more compact."""
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
            # Add style to make content more compact
            h3['style'] = 'display: inline; margin-right: 5px;'
            p['style'] = 'display: inline; margin: 0;'
    
    # Add a style attribute to the matrix itself
    skills_matrix['style'] = 'display: grid; grid-template-columns: 1fr; gap: 0.1em;'
    
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

def add_compact_styles(soup):
    """Add compact styling to make resume fit on two pages."""
    style_tag = soup.find('style') or soup.new_tag('style')
    style_tag.string = """
    /* Resume PDF Styles - Compact Version */
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
        font-weight: 700;
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
    }

    /* Professional Summary */
    .professional-summary p {
        margin: 0.3em 0;
        text-align: justify;
        line-height: 1.25;
    }

    /* Education Section */
    .education-item {
        margin-bottom: 0.5em;
        page-break-inside: avoid;
    }

    .institution {
        font-weight: 600;
        font-size: 11pt;
        line-height: 1.2;
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
        font-weight: 600;
        font-size: 11pt;
        line-height: 1.2;
    }

    .job-title {
        font-weight: normal;
        font-style: italic;
        margin-bottom: 0.2em;
        font-size: 10.5pt;
        line-height: 1.2;
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

    /* Skills Matrix Styles - Ultra Compact */
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
        font-size: 10pt !important;
        font-weight: 600 !important;
        margin: 0 4px 0 0 !important;
        padding: 0 !important;
        line-height: 1.1 !important;
        color: #444;
        display: inline;
    }

    .skill-area p {
        font-size: 9.5pt !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.1 !important;
        display: inline;
    }

    /* Hide all icon and emoji elements */
    .emoji, .icon, .fa, .fab, .fas, .far, .fal {
        display: none !important;
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
        soup.head.append(style_tag)
    else:
        soup.find('style').replace_with(style_tag)
    
    return soup

def convert_to_pdf(html_content, output_path, font_dir=None):
    """Convert HTML content to PDF with custom styling."""
    print(f"Converting resume to PDF: {output_path}")
    
    # Create base URL for resolving relative paths
    base_url = Path.cwd().as_uri()
    
    # Configure WeasyPrint with font directories
    from weasyprint.text.fonts import FontConfiguration
    font_config = FontConfiguration()
    
    # Set font directories environment variable
    if font_dir and os.path.exists(font_dir):
        print(f"Using font directory: {font_dir}")
        os.environ['WEASYPRINT_FONT_CONFIG'] = font_dir
    
    # Convert to PDF - use embedded styles
    HTML(string=str(html_content), base_url=base_url).write_pdf(
        output_path, 
        font_config=font_config
    )
    
    print(f"PDF successfully created: {output_path}")
    return output_path

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
    
    # Make content more compact to fit on two pages
    soup = compact_content(soup)
    
    # Additional optimizations
    soup = optimize_for_pdf(soup)
    soup = add_meta_tags(soup)
    
    # Add compact styles
    soup = add_compact_styles(soup)
    
    # Convert to PDF
    pdf_path = convert_to_pdf(soup, args.output, args.font_dir)
    
    print(f"\nResume conversion complete!")
    print(f"PDF saved to: {os.path.abspath(pdf_path)}")
    print("\nBest practices implemented:")
    print("- Two-page layout with balanced line height")
    print("- Ultra-compact skills matrix with inline h3/p elements")
    print("- Proper orphans/widows handling to prevent awkward breaks")
    print("- Optimized spacing between elements")
    print("- Clean header with preserved hyperlinks")
    print("- Removed all emojis and icons")
    print("- Professional typography with optimal readability")

if __name__ == "__main__":
    main()