'''
Business: Generate PDF report with KPI statistics and charts for all employees
Args: event - dict with httpMethod, body containing employee and metrics data
      context - object with request_id attribute
Returns: HTTP response with PDF file as base64
'''

import json
import io
import base64
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from datetime import datetime


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    employees: List[Dict] = body_data.get('employees', [])
    metrics: List[Dict] = body_data.get('metrics', [])
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#3B82F6'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=12,
        spaceBefore=20
    )
    
    story.append(Paragraph('KPI Отчет - Система оценки выполнения плана', title_style))
    story.append(Paragraph(f'Дата формирования: {datetime.now().strftime("%d.%m.%Y %H:%M")}', styles['Normal']))
    story.append(Spacer(1, 0.5*cm))
    
    total_plan = sum(emp.get('plan', 0) for emp in employees)
    total_fact = sum(emp.get('fact', 0) for emp in employees)
    avg_grade = sum(emp.get('grade', 0) for emp in employees) / len(employees) if employees else 0
    overall_percentage = (total_fact / total_plan * 100) if total_plan > 0 else 0
    
    story.append(Paragraph('Общая статистика', heading_style))
    
    summary_data = [
        ['Показатель', 'Значение'],
        ['Всего сотрудников', str(len(employees))],
        ['Общий план', f'{total_plan:,.0f}'.replace(',', ' ')],
        ['Общий факт', f'{total_fact:,.0f}'.replace(',', ' ')],
        ['Процент выполнения', f'{overall_percentage:.1f}%'],
        ['Средняя оценка', f'{avg_grade:.1f}']
    ]
    
    summary_table = Table(summary_data, colWidths=[8*cm, 8*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 1*cm))
    
    if employees:
        story.append(Paragraph('Детализация по сотрудникам', heading_style))
        
        emp_data = [['Сотрудник', 'План', 'Факт', 'Процент', 'Оценка']]
        for emp in sorted(employees, key=lambda x: x.get('percentage', 0), reverse=True):
            emp_data.append([
                emp.get('name', 'Без имени'),
                f'{emp.get("plan", 0):,.0f}'.replace(',', ' '),
                f'{emp.get("fact", 0):,.0f}'.replace(',', ' '),
                f'{emp.get("percentage", 0):.1f}%',
                str(emp.get('grade', 0))
            ])
        
        emp_table = Table(emp_data, colWidths=[4*cm, 3*cm, 3*cm, 3*cm, 2*cm])
        emp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        
        story.append(emp_table)
        story.append(Spacer(1, 1*cm))
    
    if metrics:
        story.append(PageBreak())
        story.append(Paragraph('Дополнительные показатели', heading_style))
        
        metrics_data = [['Показатель', 'План', 'Факт', 'Процент']]
        for metric in metrics:
            metrics_data.append([
                metric.get('name', 'Без названия'),
                str(metric.get('plan', 0)),
                str(metric.get('fact', 0)),
                f'{metric.get("percentage", 0):.1f}%'
            ])
        
        avg_bonus = sum(m.get('percentage', 0) for m in metrics) / len(metrics) if metrics else 0
        metrics_data.append(['Средний дополнительный процент', '', '', f'{avg_bonus:.1f}%'])
        
        metrics_table = Table(metrics_data, colWidths=[6*cm, 3*cm, 3*cm, 3*cm])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -2), colors.lightgrey),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#FEF7CD')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('FONTNAME', (0, -1), (0, -1), 'Helvetica-Bold'),
        ]))
        
        story.append(metrics_table)
        story.append(Spacer(1, 1*cm))
    
    if employees:
        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x = 50
        chart.y = 50
        chart.height = 125
        chart.width = 300
        
        grade_counts = [0] * 6
        for emp in employees:
            grade = emp.get('grade', 0)
            if 0 <= grade <= 5:
                grade_counts[grade] += 1
        
        chart.data = [grade_counts]
        chart.categoryAxis.categoryNames = ['0', '1', '2', '3', '4', '5']
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = max(grade_counts) + 1 if max(grade_counts) > 0 else 5
        chart.bars[0].fillColor = colors.HexColor('#3B82F6')
        
        drawing.add(chart)
        story.append(Paragraph('Распределение оценок', heading_style))
        story.append(drawing)
    
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'pdf': pdf_base64,
            'filename': f'kpi-report-{datetime.now().strftime("%Y%m%d-%H%M%S")}.pdf'
        })
    }
