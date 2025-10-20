import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с тестами - создание, получение, обновление тестов и сохранение ответов
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с statusCode, headers, body
    '''
    method: str = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    path: str = query_params.get('path', '')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET' and '/template' in path:
            cur.execute('''
                SELECT id, title, description, welcome_title, welcome_subtitle, 
                       questions, created_at, updated_at 
                FROM t_p90617481_stylist_quiz_creatio.quiz_templates 
                ORDER BY id DESC LIMIT 1
            ''')
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            template = dict(result)
            template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
            template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(template),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and '/template' in path:
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO t_p90617481_stylist_quiz_creatio.quiz_templates 
                (title, description, welcome_title, welcome_subtitle, questions, name)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, title, description, welcome_title, welcome_subtitle, 
                          questions, created_at, updated_at
            ''', (
                body_data.get('title', ''),
                body_data.get('description', ''),
                body_data.get('welcomeTitle', ''),
                body_data.get('welcomeSubtitle', ''),
                json.dumps(body_data.get('questions', [])),
                body_data.get('title', 'Новый тест')
            ))
            
            result = cur.fetchone()
            template = dict(result)
            template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
            template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(template),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and '/template' in path:
            body_data = json.loads(event.get('body', '{}'))
            template_id = body_data.get('id')
            
            if not template_id:
                cur.execute('SELECT id FROM t_p90617481_stylist_quiz_creatio.quiz_templates ORDER BY id DESC LIMIT 1')
                result = cur.fetchone()
                template_id = result['id'] if result else None
            
            if not template_id:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE t_p90617481_stylist_quiz_creatio.quiz_templates 
                SET title = %s, 
                    description = %s, 
                    welcome_title = %s, 
                    welcome_subtitle = %s, 
                    questions = %s,
                    name = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, title, description, welcome_title, welcome_subtitle, 
                          questions, created_at, updated_at
            ''', (
                body_data.get('title', ''),
                body_data.get('description', ''),
                body_data.get('welcomeTitle', ''),
                body_data.get('welcomeSubtitle', ''),
                json.dumps(body_data.get('questions', [])),
                body_data.get('title', 'Тест'),
                template_id
            ))
            
            result = cur.fetchone()
            if not result:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            template = dict(result)
            template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
            template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(template),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and '/response' in path:
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('SELECT id FROM t_p90617481_stylist_quiz_creatio.quiz_templates ORDER BY id DESC LIMIT 1')
            template_result = cur.fetchone()
            template_id = template_result['id'] if template_result else None
            
            name = body_data.get('name', '') or body_data.get('contact', {}).get('name', '')
            phone = body_data.get('phone', '') or body_data.get('contact', {}).get('phone', '')
            email = body_data.get('email', '') or body_data.get('contact', {}).get('email', '')
            
            cur.execute('''
                INSERT INTO t_p90617481_stylist_quiz_creatio.quiz_responses 
                (template_id, contact_name, contact_phone, contact_email, answers, name, phone, email)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                template_id,
                name,
                phone,
                email,
                json.dumps(body_data),
                name,
                phone,
                email
            ))
            
            result = cur.fetchone()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'success': True, 'id': result['id']}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and '/admin/responses' in path:
            cur.execute('''
                SELECT r.id, r.template_id, r.contact_name as name, r.contact_phone as phone, 
                       r.contact_email as email, r.answers, r.completed_at
                FROM t_p90617481_stylist_quiz_creatio.quiz_responses r
                ORDER BY r.completed_at DESC
            ''')
            results = cur.fetchall()
            
            responses = []
            for row in results:
                resp_data = {
                    'id': row['id'],
                    'name': row['name'] or '',
                    'phone': row['phone'] or '',
                    'email': row['email'] or '',
                    'completed_at': row['completed_at'].isoformat() if row['completed_at'] else None
                }
                
                if row['answers']:
                    try:
                        answers = row['answers']
                        if isinstance(answers, str):
                            answers = json.loads(answers)
                        if isinstance(answers, dict):
                            resp_data.update(answers)
                    except Exception as e:
                        print(f"Error parsing answers: {e}")
                
                responses.append(resp_data)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(responses),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE' and '/template' in path:
            cur.execute('''
                DELETE FROM t_p90617481_stylist_quiz_creatio.quiz_templates
                WHERE id IN (SELECT id FROM t_p90617481_stylist_quiz_creatio.quiz_templates ORDER BY id DESC LIMIT 1)
                RETURNING id
            ''')
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Template not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'deleted_id': result['id']}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if conn:
            conn.close()