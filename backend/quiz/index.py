import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle quiz templates, responses and admin authentication
    Args: event - dict with httpMethod, body, queryStringParameters, path
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    
    if '/template' in path:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute("""
                SELECT id, name, description, questions, created_at, updated_at 
                FROM t_p90617481_stylist_quiz_creatio.quiz_templates 
                ORDER BY updated_at DESC 
                LIMIT 1
            """)
            row = cur.fetchone()
            cur.close()
            conn.close()
            
            if row:
                quiz = {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'questions': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None
                }
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(quiz),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No quiz found'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            description = body_data.get('description')
            questions = body_data.get('questions')
            
            cur.execute("""
                INSERT INTO t_p90617481_stylist_quiz_creatio.quiz_templates 
                (name, description, questions) 
                VALUES (%s, %s, %s) 
                RETURNING id, name, description, questions, created_at, updated_at
            """, (name, description, json.dumps(questions)))
            
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            quiz = {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'questions': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'updated_at': row[5].isoformat() if row[5] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(quiz),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            quiz_id = body_data.get('id')
            name = body_data.get('name')
            description = body_data.get('description')
            questions = body_data.get('questions')
            
            cur.execute("""
                UPDATE t_p90617481_stylist_quiz_creatio.quiz_templates 
                SET name = %s, description = %s, questions = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s 
                RETURNING id, name, description, questions, created_at, updated_at
            """, (name, description, json.dumps(questions), quiz_id))
            
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            if row:
                quiz = {
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'questions': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None
                }
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(quiz),
                    'isBase64Encoded': False
                }
    
    if method == 'POST' and '/response' in path:
        body_data = json.loads(event.get('body', '{}'))
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO quiz_responses 
            (name, email, phone, age_range, body_type, style_preferences, 
             color_preferences, wardrobe_goals, budget_range, lifestyle)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            body_data.get('name'),
            body_data.get('email'),
            body_data.get('phone'),
            body_data.get('age_range'),
            body_data.get('body_type'),
            body_data.get('style_preferences'),
            body_data.get('color_preferences'),
            body_data.get('wardrobe_goals'),
            body_data.get('budget_range'),
            body_data.get('lifestyle')
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    if method == 'GET' and '/admin/responses' in path:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT id, name, email, phone, age_range, body_type, 
                   style_preferences, color_preferences, wardrobe_goals, 
                   budget_range, lifestyle, completed_at
            FROM quiz_responses
            ORDER BY completed_at DESC
        """)
        
        responses = cur.fetchall()
        cur.close()
        conn.close()
        
        result = []
        for row in responses:
            result.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'phone': row['phone'],
                'age_range': row['age_range'],
                'body_type': row['body_type'],
                'style_preferences': row['style_preferences'],
                'color_preferences': row['color_preferences'],
                'wardrobe_goals': row['wardrobe_goals'],
                'budget_range': row['budget_range'],
                'lifestyle': row['lifestyle'],
                'completed_at': row['completed_at'].isoformat() if row['completed_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }