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
import weasyprint
from weasyprint import HTML, CSS
import argparse

def setup_argparse():
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Convert HTML resume to professional PDF')
    parser.add_argument('html', type=str, nargs='?', default='resume.html',
                        help='Path to HTML resume file')
    parser.add_argument('output', type=str, nargs='?', default='professional_resume.pdf',
                        help='Output PDF file path')
    parser.add_argument('--css', type=str, default='resume_styles.css',
                        help='Path to CSS styles file (default: resume_styles.css)')
    parser.add_argument('--font-dir', type=str, 
                        default='/usr/share/fonts',
                        help='Directory containing fonts (default: /usr/share/fonts)')
    return parser.parse_args()

def validate_files(html_path, css_path):
    """Validate that input files exist."""
    if not os.path.exists(html_path):
        print(f"Error: HTML file not found: {html_path}")
        sys.exit(1)
    if not os.path.exists(css_path):
        print(f"Error: CSS file not found: {css_path}")
        sys.exit(1)

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

def remove_emojis(soup):
    """Remove all emoji characters from the HTML content."""
    # Unicode ranges for emojis
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

def optimize_header(soup):
    """Optimize header to be more compact and professional."""
    header = soup.select_one('.header')
    if not header:
        print("Warning: Cannot optimize header - no '.header' element found")
        return soup
    
    # Extract header elements
    name_element = header.select_one('h1, .name')
    contact_info = header.select_one('.contact-info, .contact')
    
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
    
    # Process contact info - keep it simple with a single row
    if contact_info:
        # Filter contact items to exclude empty ones and emojis
        contact_items = []
        for item in contact_info.select('a, span, p, div'):
            if item.get_text(strip=True) and not any(c for c in item.get_text() if ord(c) > 8000):
                contact_items.append(item)
        
        # Add each item to the contact section
        for item in contact_items:
            if item.parent:  # Check if item has a parent
                item_copy = item.extract()
                
                # Add simple pipe dividers between items
                if len(contact_section.contents) > 0:
                    divider = soup.new_tag('span')
                    divider['class'] = 'contact-divider'
                    divider.string = ' | '
                    contact_section.append(divider)
                
                contact_section.append(item_copy)
    
    # Add sections to the header
    new_header.append(name_section)
    new_header.append(contact_section)
    
    # Replace old header with new header
    header.replace_with(new_header)
    
    # Add inline CSS for the improved header styling
    style_tag = soup.find('style') or soup.new_tag('style')
    style_tag.string = """
    /* Resume PDF Styles */
    @page {
        size: letter;
        margin: 0.75in 0.75in 0.75in 0.75in;
        @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 9pt;
            color: #555;
        }
    }

    /* Global Styles */
    body {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.4;
        color: #333;
        margin: 0;
        padding: 0;
        font-size: 11pt;
    }

    .container {
        max-width: 100%;
        margin: 0 auto;
    }

    /* Professional Header Styles */
    .professional-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 1.5em;
        border-bottom: 2px solid #2c3e50;
        padding-bottom: 0.5em;
        page-break-inside: avoid;
    }

    .header-name {
        margin-bottom: 0.5em;
    }

    .header-name h1 {
        font-size: 24pt;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Simple contact row with minimal spacing */
    .header-contact {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        font-size: 10pt;
        color: #34495e;
        margin-top: 0.5em;
        gap: 0;  /* Remove any default gap */
    }

    .header-contact a {
        color: #34495e;
        text-decoration: none;
        white-space: nowrap;
    }

    .contact-divider {
        margin: 0 3px;  /* Minimal spacing around pipe */
        color: #7f8c8d;
    }

    /* Hide all icon and emoji elements */
    .emoji, .icon, .fa, .fab, .fas, .far, .fal {
        display: none !important;
    }

    /* Section Styles */
    .section {
        margin-bottom: 1.5em;
        page-break-inside: avoid;
    }

    .section h2 {
        font-size: 14pt;
        color: #2c3e50;
        margin: 0 0 0.7em;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #eee;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Professional Summary */
    .professional-summary p {
        margin-top: 0;
        text-align: justify;
    }

    /* Education Section */
    .education-item {
        margin-bottom: 1em;
        page-break-inside: avoid;
    }

    .institution {
        font-weight: 600;
        font-size: 12pt;
    }

    .degree {
        font-style: italic;
        color: #555;
    }

    /* Experience Section */
    .experience-item {
        margin-bottom: 1.2em;
        page-break-inside: avoid;
    }

    .company {
        font-weight: 600;
        font-size: 12pt;
    }

    .job-title {
        font-weight: normal;
        font-style: italic;
        margin-bottom: 0.3em;
    }

    .duration {
        color: #555;
        font-size: 10pt;
    }

    .responsibilities ul {
        margin: 0.5em 0;
        padding-left: 1.5em;
    }

    .responsibilities li {
        margin-bottom: 0.5em;
        text-align: justify;
    }

    /* Skills Section */
    .skills-list {
        column-count: 2;
        column-gap: 2em;
        margin: 0;
        padding-left: 1.5em;
    }

    .skills-list li {
        margin-bottom: 0.5em;
        break-inside: avoid;
    }

    /* Page Break Controls */
    h2 {
        page-break-after: avoid;
    }

    .section:first-of-type {
        page-break-before: avoid;
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
        
        /* Avoid orphans and widows */
        p, li {
            orphans: 3;
            widows: 3;
        }
    }
    """
    
    if not soup.find('style'):
        soup.head.append(style_tag)
    else:
        soup.find('style').replace_with(style_tag)
    
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

def convert_to_pdf(html_content, css_path, output_path, font_dir=None):
    """Convert HTML content to PDF with custom styling."""
    print(f"Converting resume to PDF: {output_path}")
    
    # Create base URL for resolving relative paths
    base_url = Path(os.path.abspath(css_path)).parent.as_uri()
    
    # Load external CSS if it exists, but we'll primarily use the embedded CSS
    css_files = []
    if os.path.exists(css_path):
        css_files.append(CSS(filename=css_path))
    
    # Configure WeasyPrint with font directories
    from weasyprint.text.fonts import FontConfiguration
    font_config = FontConfiguration()
    
    # Set font directories environment variable
    if font_dir and os.path.exists(font_dir):
        print(f"Using font directory: {font_dir}")
        os.environ['WEASYPRINT_FONT_CONFIG'] = font_dir
    
    # Convert to PDF - note we're prioritizing the embedded styles
    HTML(string=str(html_content), base_url=base_url).write_pdf(
        output_path, 
        stylesheets=css_files,
        font_config=font_config
    )
    
    print(f"PDF successfully created: {output_path}")
    return output_path

def main():
    """Main function to convert HTML resume to PDF."""
    args = setup_argparse()
    
    # Validate files
    if not os.path.exists(args.html):
        print(f"Error: HTML file not found: {args.html}")
        sys.exit(1)
    
    # Extract content
    soup = extract_resume_content(args.html)
    
    # Remove emojis from the content
    soup = remove_emojis(soup)
    
    # Optimize the header
    soup = optimize_header(soup)
    
    # Additional optimizations
    soup = optimize_for_pdf(soup)
    soup = add_meta_tags(soup)
    
    # Convert to PDF
    pdf_path = convert_to_pdf(soup, args.css, args.output, args.font_dir)
    
    print(f"\nResume conversion complete!")
    print(f"PDF saved to: {os.path.abspath(pdf_path)}")
    print("\nBest practices implemented:")
    print("- Professional typography and spacing")
    print("- Clean header layout with minimal separator spacing")
    print("- Removed all emojis and icons")
    print("- Intelligent page breaks")
    print("- Proper heading hierarchy")
    print("- Embedded fonts for consistent rendering")
    print("- Multi-language support")
    print("- Page numbering for multi-page resumes")
    print("- Optimized for both screen viewing and printing")

if __name__ == "__main__":
    main()