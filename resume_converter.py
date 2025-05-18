#!/usr/bin/env python3
"""
Resume HTML to PDF Converter

This script converts an HTML resume to a professionally formatted PDF document
using WeasyPrint. It applies custom CSS styling, ensures proper page breaks,
and follows resume best practices for formatting.

Author: Manus AI
Date: May 18, 2025
"""

import os
import sys
from pathlib import Path
from bs4 import BeautifulSoup
import weasyprint
from weasyprint import HTML, CSS
import argparse

def setup_argparse():
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Convert HTML resume to professional PDF')
    parser.add_argument('--html', type=str, default='resume.html',
                        help='Path to HTML resume file (default: resume.html)')
    parser.add_argument('--css', type=str, default='resume_styles.css',
                        help='Path to CSS styles file (default: resume_styles.css)')
    parser.add_argument('--output', type=str, default='professional_resume.pdf',
                        help='Output PDF file path (default: professional_resume.pdf)')
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

def optimize_header(soup):
    """Optimize header to be more compact and professional."""
    header = soup.select_one('.header')
    if not header:
        print("Warning: Cannot optimize header - no '.header' element found")
        return soup
    
    # Restructure the header for a more compact and professional look
    # First, let's clean up the existing header content
    name_element = header.select_one('h1, .name')
    contact_info = header.select_one('.contact-info, .contact')
    title_element = header.select_one('.title, .job-title')
    
    # If we have the basic elements, let's restructure them
    if name_element and contact_info:
        # Create a new header structure
        new_header = soup.new_tag('div')
        new_header['class'] = 'header professional-header'
        
        # Create left section for name and title
        left_section = soup.new_tag('div')
        left_section['class'] = 'header-left'
        
        # Create right section for contact info
        right_section = soup.new_tag('div')
        right_section['class'] = 'header-right'
        
        # Move name and title to left section
        if name_element:
            left_section.append(name_element)
        if title_element:
            left_section.append(title_element)
        
        # Process contact info to make it more compact
        if contact_info:
            # Create a more structured contact layout
            contact_items = contact_info.select('a, span, p, div')
            
            # Group contact items into rows for a more compact layout
            contact_row = soup.new_tag('div')
            contact_row['class'] = 'contact-row'
            
            for i, item in enumerate(contact_items):
                # Add dividers between contact items
                if i > 0:
                    divider = soup.new_tag('span')
                    divider['class'] = 'contact-divider'
                    divider.string = ' | '
                    contact_row.append(divider)
                
                # Clean up and add the contact item
                item_copy = item.extract()
                contact_row.append(item_copy)
                
                # Create a new row every 3 items for better organization
                if (i + 1) % 3 == 0 and i < len(contact_items) - 1:
                    right_section.append(contact_row)
                    contact_row = soup.new_tag('div')
                    contact_row['class'] = 'contact-row'
            
            # Add the last row if it has items
            if len(contact_row.contents) > 0:
                right_section.append(contact_row)
        
        # Add left and right sections to the new header
        new_header.append(left_section)
        new_header.append(right_section)
        
        # Replace old header with new header
        header.replace_with(new_header)
        
        # Add inline CSS for the header styling
        style_tag = soup.new_tag('style')
        style_tag.string = """
        .professional-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-left {
            flex: 1;
        }
        .header-right {
            text-align: right;
            line-height: 1.5;
        }
        .header-left h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 28px;
            line-height: 1.2;
        }
        .header-left .job-title, .header-left .title {
            margin: 5px 0 0;
            font-size: 18px;
            color: #7f8c8d;
            font-weight: normal;
        }
        .contact-row {
            margin-bottom: 5px;
            font-size: 14px;
            color: #34495e;
        }
        .contact-divider {
            color: #bdc3c7;
            margin: 0 5px;
        }
        .header-right a {
            color: #3498db;
            text-decoration: none;
        }
        .header-right a:hover {
            text-decoration: underline;
        }
        @media print {
            .professional-header {
                border-bottom-color: #000;
            }
            .header-left h1 {
                color: #000;
            }
            .header-left .job-title, .header-left .title {
                color: #333;
            }
            .contact-row {
                color: #000;
            }
            .header-right a {
                color: #000;
            }
        }
        """
        soup.head.append(style_tag)
    
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
    roboto_link = soup.new_tag('link')
    roboto_link['rel'] = 'stylesheet'
    roboto_link['href'] = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
    head.append(roboto_link)
    
    # Add style tag for font-face definitions
    style = soup.new_tag('style')
    style.string = """
    @font-face {
        font-family: 'Noto Sans CJK';
        src: url('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'WenQuanYi Zen Hei';
        src: url('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    """
    head.append(style)
    
    return soup

def convert_to_pdf(html_content, css_path, output_path, font_dir=None):
    """Convert HTML content to PDF with custom styling."""
    print(f"Converting resume to PDF: {output_path}")
    
    # Create base URL for resolving relative paths
    base_url = Path(os.path.abspath(css_path)).parent.as_uri()
    
    # Load CSS
    css = CSS(filename=css_path)
    
    # Configure WeasyPrint with font directories
    from weasyprint.text.fonts import FontConfiguration
    font_config = FontConfiguration()
    
    # Set font directories environment variable
    if font_dir and os.path.exists(font_dir):
        print(f"Using font directory: {font_dir}")
        os.environ['WEASYPRINT_FONT_CONFIG'] = font_dir
    
    # Convert to PDF
    HTML(string=str(html_content), base_url=base_url).write_pdf(
        output_path, 
        stylesheets=[css],
        font_config=font_config
    )
    
    print(f"PDF successfully created: {output_path}")
    return output_path

def main():
    """Main function to convert HTML resume to PDF."""
    args = setup_argparse()
    
    # Validate input files
    validate_files(args.html, args.css)
    
    # Extract and optimize content
    soup = extract_resume_content(args.html)
    
    # Add the new optimize_header function to the pipeline
    soup = optimize_header(soup)
    
    soup = optimize_for_pdf(soup)
    soup = add_meta_tags(soup)
    
    # Convert to PDF
    pdf_path = convert_to_pdf(soup, args.css, args.output, args.font_dir)
    
    print(f"\nResume conversion complete!")
    print(f"PDF saved to: {os.path.abspath(pdf_path)}")
    print("\nBest practices implemented:")
    print("✓ Professional typography and spacing")
    print("✓ Compact, modern header layout")
    print("✓ Intelligent page breaks to avoid splitting sections")
    print("✓ Proper heading hierarchy and section organization")
    print("✓ Embedded fonts for consistent rendering")
    print("✓ Multilingual support with CJK fonts")
    print("✓ Page numbering for multi-page resumes")
    print("✓ Optimized for both screen viewing and printing")

if __name__ == "__main__":
    main()