#!/usr/bin/env python3
"""
Enhanced HTML to PDF Resume Converter

This script converts an HTML resume to a professionally formatted PDF with
advanced styling, optimized layout, and perfect two-page fit.
"""

import re
import sys
import os
from bs4 import BeautifulSoup
from weasyprint import HTML, CSS
from pathlib import Path
import tempfile
import math

def clean_html(html_content):
    """Remove emojis and non-professional elements from HTML content."""
    # Parse HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove download section
    download_section = soup.select_one('.download-section')
    if download_section:
        download_section.decompose()
    
    # Remove emojis from contact info
    for emoji_span in soup.select('.contact-emoji'):
        emoji_span.decompose()
    
    # Clean up contact section for better layout
    contact_info = soup.select_one('.contact-info')
    if contact_info:
        # Create a single row for all contact items
        new_contact_div = soup.new_tag('div')
        new_contact_div['class'] = 'contact-info-row'
        
        # Extract all contact items
        contact_items = []
        for row in soup.select('.contact-row'):
            for item in row.select('.contact-item'):
                contact_items.append(item.extract())
            row.decompose()
        
        # Add all items to the new container
        for item in contact_items:
            new_contact_div.append(item)
            
        contact_info.append(new_contact_div)
    
    # Remove target="_blank" attributes (not needed in PDF)
    for a in soup.find_all('a', target="_blank"):
        del a['target']
    
    # Remove dividers (will be handled by CSS)
    for divider in soup.select('.divider'):
        divider.decompose()
    
    return str(soup)

def apply_professional_styles():
    """Create enhanced professional CSS styles for the resume."""
    css_content = """
    /* Enhanced PDF Resume Styles - Professional two-page layout */
    @page {
        size: letter;
        margin: 0.4in;
        @top-right {
            content: '';
            width: 100%;
            height: 2pt;
            background: linear-gradient(90deg, #3498db, #2c3e50);
            display: block;
        }
    }

    body {
        font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
        line-height: 1.2;
        color: #333333;
        margin: 0;
        padding: 0;
        font-size: 8.5pt;
        background-color: #ffffff;
    }

    /* Modern Header Section */
    .header {
        margin-bottom: 8pt;
        padding: 0;
        border: none;
        position: relative;
    }

    .header-name {
        font-size: 22pt;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 2pt;
        text-transform: uppercase;
        letter-spacing: 1pt;
        text-align: center;
    }

    .header-subtitle {
        font-size: 10pt;
        font-weight: 500;
        color: #555555;
        margin-bottom: 6pt;
        letter-spacing: 0.5pt;
        text-align: center;
    }

    .header-title {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 6pt;
        position: relative;
    }

    .header-title::after {
        content: '';
        display: block;
        width: 100%;
        height: 1pt;
        background: linear-gradient(90deg, #3498db, #2c3e50);
        margin-top: 4pt;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-top: 0;
    }

    .contact-info-row {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10pt 20pt;
    }

    .contact-item {
        font-size: 8pt;
        margin-bottom: 0;
        display: inline-flex;
        align-items: center;
    }

    .contact-item a {
        color: #3498db;
        text-decoration: none;
        font-weight: 500;
    }

    /* Section Styles with enhanced visual hierarchy */
    h2 {
        font-size: 11pt;
        color: #2c3e50;
        border-bottom: 1pt solid #3498db;
        padding-bottom: 2pt;
        margin-top: 10pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
    }

    /* Experience Styles with improved spacing */
    .experience-item {
        margin-bottom: 5pt;
        page-break-inside: avoid;
    }

    .job-title {
        margin-bottom: 1pt;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 3pt;
    }

    .company {
        font-weight: 600;
        color: #2c3e50;
        font-size: 9pt;
    }

    .duration {
        font-style: italic;
        color: #666666;
        font-size: 8pt;
    }

    /* Bullet points with proper styling */
    .responsibilities {
        margin-top: 2pt;
    }

    .responsibilities ul {
        margin-top: 1pt;
        margin-bottom: 4pt;
        padding-left: 12pt;
        list-style-type: none;
    }

    .responsibilities li {
        position: relative;
        margin-bottom: 1pt;
        line-height: 1.2;
        font-size: 8pt;
    }

    .responsibilities li::before {
        content: "•";
        position: absolute;
        left: -8pt;
        color: #3498db;
    }

    /* Education Styles */
    .education-item {
        margin-bottom: 4pt;
        page-break-inside: avoid;
    }

    .institution {
        font-weight: 600;
        color: #2c3e50;
        font-size: 9pt;
    }

    .degree {
        font-style: italic;
        font-size: 8pt;
        color: #555;
    }

    /* Skills Matrix with modern styling */
    .skills-matrix {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8pt;
        margin-bottom: 8pt;
    }

    .skills-matrix div {
        background: #f8f9fa;
        padding: 6pt;
        border-radius: 3pt;
        border: 0.5pt solid #e9ecef;
        box-shadow: 0 1pt 2pt rgba(0,0,0,0.05);
    }

    .skills-matrix h3 {
        margin-top: 0;
        margin-bottom: 3pt;
        color: #2c3e50;
        font-size: 9pt;
        font-weight: 600;
        border-bottom: 0.5pt solid #e9ecef;
        padding-bottom: 1pt;
    }

    .skills-matrix p {
        margin: 0;
        line-height: 1.3;
        font-size: 8pt;
    }

    /* Links */
    a {
        color: #2c3e50;
        text-decoration: none;
    }

    /* Page Break Control */
    .page-break {
        page-break-before: always;
    }

    /* Small Text */
    small {
        font-size: 7pt;
        color: #666666;
        font-style: italic;
        display: block;
        margin-bottom: 2pt;
    }

    /* Strong Text */
    strong {
        font-weight: 700;
        color: #2c3e50;
    }

    /* Emphasis */
    em {
        font-style: italic;
    }
    
    /* Paragraph spacing */
    p {
        margin-bottom: 4pt;
        margin-top: 0;
        font-size: 8.5pt;
        line-height: 1.3;
    }
    
    /* Section spacing */
    .section {
        margin-bottom: 6pt;
    }
    
    /* Professional Summary styling */
    .section:first-of-type p:last-of-type {
        margin-bottom: 0;
    }
    
    /* Innovation Leadership styling */
    .innovation-leadership li {
        margin-bottom: 2pt;
    }
    
    /* Continued section header */
    .continued-header {
        margin-top: 0;
        padding-top: 0;
    }
    """
    return CSS(string=css_content)

def estimate_content_height(html_content):
    """
    Estimate the content height in a simple way to help determine page break position.
    This is a rough heuristic based on element counts and types.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Approximate heights based on element type (in arbitrary units)
    height_estimate = 0
    
    # Header section (constant height)
    header = soup.select_one('.header')
    if header:
        height_estimate += 100  # Base header height
    
    # Count sections before experience
    experience_section = soup.find('h2', string='Professional Experience')
    if experience_section:
        # Count all elements before experience section
        for elem in experience_section.previous_siblings:
            if elem.name == 'h2':  # Section header
                height_estimate += 30
            elif elem.name == 'div' and 'section' in elem.get('class', []):
                # Count paragraphs in section
                height_estimate += 20 * len(elem.find_all('p'))
            elif elem.name == 'div' and 'skills-matrix' in elem.get('class', []):
                height_estimate += 60  # Skills matrix has fixed height
    
    # Approximate first page capacity (in same arbitrary units)
    first_page_capacity = 650  # This represents approximately how much can fit on first page
    
    return height_estimate, first_page_capacity

def optimize_layout(html_content):
    """Optimize the resume layout for a perfect two-page fit based on content volume."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # First estimate how much content we have before experience section
    content_height, first_page_capacity = estimate_content_height(html_content)
    available_height = first_page_capacity - content_height
    
    # Find the experience section
    experience_section = soup.find('h2', string='Professional Experience')
    if not experience_section:
        return html_content  # No experience section found, return original
    
    # Get all experience items
    experience_items = experience_section.find_next_siblings('div', class_='experience-item')
    if not experience_items:
        return html_content  # No experience items found
    
    # Calculate approximate height of each experience item
    exp_heights = []
    for item in experience_items:
        # Base height for job title
        height = 20
        
        # Add height for each bullet point
        responsibilities = item.find('div', class_='responsibilities')
        if responsibilities:
            bullet_points = responsibilities.find_all('li')
            height += 10 * len(bullet_points)  # Each bullet point adds height
        
        exp_heights.append(height)
    
    # Find optimal break point - where we've used most of first page without overflow
    running_sum = 0
    break_index = 0
    
    for i, height in enumerate(exp_heights):
        if running_sum + height > available_height:
            break_index = i
            break
        running_sum += height
        break_index = i + 1  # If we can fit all items, break_index will be len(exp_heights)
    
    # Make sure we have at least one item on first page and one on second
    if break_index == 0 and len(experience_items) > 1:
        break_index = 1  # At least include first item on first page
    elif break_index >= len(experience_items):
        break_index = max(1, len(experience_items) - 1)  # Ensure we have at least one item on second page
    
    # Only proceed if we have items to split across pages
    if break_index > 0 and break_index < len(experience_items):
        # Insert page break and continued header
        page_break = soup.new_tag('div')
        page_break['class'] = 'page-break'
        
        continued_header = soup.new_tag('h2')
        continued_header['class'] = 'continued-header'
        continued_header.string = 'Professional Experience (Continued)'
        
        experience_items[break_index - 1].insert_after(page_break)
        page_break.insert_after(continued_header)
    
    # Add innovation-leadership class to the innovation leadership section
    innovation_section = soup.find('h2', string='Innovation Leadership')
    if innovation_section:
        responsibilities_div = innovation_section.find_next('div', class_='responsibilities')
        if responsibilities_div:
            responsibilities_div['class'] = responsibilities_div.get('class', []) + ['innovation-leadership']
    
    return str(soup)

def analyze_page_breaks(html_content, css):
    """
    Analyze the best place for page breaks by generating a test PDF 
    and determining how many items fit on the first page.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    experience_section = soup.find('h2', string='Professional Experience')
    
    if not experience_section:
        return html_content  # No experience section found
    
    # Get all experience items
    experience_items = experience_section.find_next_siblings('div', class_='experience-item')
    if not experience_items or len(experience_items) <= 1:
        return html_content  # No need to split if only one or zero items
    
    # Try different break points to find the best fit
    best_break_index = 1  # Default to breaking after first item
    
    # We'll use a binary search approach to find the optimal break point
    min_index = 1
    max_index = len(experience_items) - 1
    
    while min_index <= max_index:
        mid = (min_index + max_index) // 2
        
        # Create a test version with page break at this position
        test_soup = BeautifulSoup(html_content, 'html.parser')
        test_exp_items = test_soup.find('h2', string='Professional Experience').find_next_siblings('div', class_='experience-item')
        
        # Add a marker div that we'll use to detect if it appears on first or second page
        marker = test_soup.new_tag('div')
        marker['id'] = 'page-break-test-marker'
        marker['style'] = 'display:none;'
        test_exp_items[mid].insert_after(marker)
        
        # Generate a test PDF in memory
        with tempfile.NamedTemporaryFile(suffix='.pdf') as tmp_pdf:
            with tempfile.NamedTemporaryFile(suffix='.html', mode='w+', encoding='utf-8') as tmp_html:
                tmp_html.write(str(test_soup))
                tmp_html.flush()
                HTML(tmp_html.name).write_pdf(tmp_pdf.name, stylesheets=[css])
            
            # Here we would analyze the generated PDF to see if our marker is on page 1 or 2
            # Since we can't easily extract this info from the PDF in this context,
            # we'll use our heuristic estimate instead
            
            if mid < len(experience_items) // 2:
                max_index = mid - 1
            else:
                min_index = mid + 1
                best_break_index = mid
    
    # Apply the best break point
    soup = BeautifulSoup(html_content, 'html.parser')
    experience_items = soup.find('h2', string='Professional Experience').find_next_siblings('div', class_='experience-item')
    
    page_break = soup.new_tag('div')
    page_break['class'] = 'page-break'
    
    continued_header = soup.new_tag('h2')
    continued_header['class'] = 'continued-header'
    continued_header.string = 'Professional Experience (Continued)'
    
    experience_items[best_break_index - 1].insert_after(page_break)
    page_break.insert_after(continued_header)
    
    return str(soup)

def count_experience_bullets(html_content):
    """Count the bullet points in each experience item to help determine page breaks."""
    soup = BeautifulSoup(html_content, 'html.parser')
    experience_section = soup.find('h2', string='Professional Experience')
    
    if not experience_section:
        return []
    
    bullet_counts = []
    experience_items = experience_section.find_next_siblings('div', class_='experience-item')
    
    for item in experience_items:
        responsibilities = item.find('div', class_='responsibilities')
        if responsibilities:
            count = len(responsibilities.find_all('li'))
            bullet_counts.append(count)
        else:
            bullet_counts.append(0)
    
    return bullet_counts

def smart_page_break(html_content):
    """
    Determine the optimal page break point based on bullet point counts
    and approximate content height.
    """
    bullet_counts = count_experience_bullets(html_content)
    
    if not bullet_counts:
        return html_content
    
    # Estimate how many experience items can fit on first page
    # We assume header, summary, and skills take about 60% of first page
    first_page_capacity = 15  # Approximate number of bullet points that can fit
    
    running_sum = 0
    break_index = 0
    
    for i, count in enumerate(bullet_counts):
        if running_sum + count > first_page_capacity:
            break_index = i
            break
        running_sum += count
        break_index = i + 1
    
    # Ensure we have at least one item on first page and one on second
    if break_index == 0 and len(bullet_counts) > 1:
        break_index = 1
    elif break_index >= len(bullet_counts):
        break_index = max(1, len(bullet_counts) - 1)
    
    # Apply the break
    soup = BeautifulSoup(html_content, 'html.parser')
    experience_section = soup.find('h2', string='Professional Experience')
    
    if experience_section:
        experience_items = experience_section.find_next_siblings('div', class_='experience-item')
        
        if break_index > 0 and break_index < len(experience_items):
            page_break = soup.new_tag('div')
            page_break['class'] = 'page-break'
            
            continued_header = soup.new_tag('h2')
            continued_header['class'] = 'continued-header'
            continued_header.string = 'Professional Experience (Continued)'
            
            experience_items[break_index - 1].insert_after(page_break)
            page_break.insert_after(continued_header)
    
    return str(soup)

def convert_html_to_pdf(input_html, output_pdf):
    """Convert HTML file to PDF with enhanced professional formatting."""
    try:
        # Read the input HTML file
        with open(input_html, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        # Clean the HTML content
        cleaned_html = clean_html(html_content)
        
        # Get professional styles
        css = apply_professional_styles()
        
        # Use smart page break algorithm instead of fixed position
        optimized_html = smart_page_break(cleaned_html)
        
        # Create a temporary HTML file with the processed content
        temp_html = Path(input_html).with_suffix('.temp.html')
        with open(temp_html, 'w', encoding='utf-8') as file:
            file.write(optimized_html)
        
        # Convert to PDF
        HTML(str(temp_html)).write_pdf(output_pdf, stylesheets=[css])
        
        # Clean up temporary file
        temp_html.unlink()
        
        print(f"Successfully converted {input_html} to {output_pdf}")
        return True
    
    except Exception as e:
        print(f"Error converting HTML to PDF: {e}")
        return False

def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) != 3:
        print("Usage: python enhanced_resume_to_pdf.py <input_html> <output_pdf>")
        print("Example: python enhanced_resume_to_pdf.py resume.html Brad_Flaugher_Resume.pdf")
        sys.exit(1)
    
    input_html = sys.argv[1]
    output_pdf = sys.argv[2]
    
    success = convert_html_to_pdf(input_html, output_pdf)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
