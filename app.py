from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import urllib.parse

app = Flask(__name__)
CORS(app)

@app.route('/api/faculty', methods=['GET'])
def get_faculty():
    dept = request.args.get('dept', 'cse').lower()
    search_name = request.args.get('name', '').lower()
    
    url = f'https://www.rajalakshmi.org/departments/{dept}'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return jsonify({'error': f'Failed to fetch department page. Status: {response.status_code}'}), 500
        
        html = response.text
        
        # Regex to find faculty names and designations
        # Example format: "Dr.Chettiyar Vani Vivekanand, PROFESSOR"
        matches = re.findall(r'\\?\"text\\?\":\\?\"((?:Dr\.|Mr\.|Mrs\.|Ms\.)[^\\"]+)\\?\"', html)
        
        faculty_list = []
        seen = set()
        achievements_pool = []
        
        for match in matches:
            if len(match) < 100 and ('PROFESSOR' in match.upper() or 'HEAD' in match.upper() or 'DEAN' in match.upper() or ',' in match):
                if match not in seen:
                    seen.add(match)
            else:
                achievements_pool.append(match)
                
        for match in seen:
            parts = match.split(',', 1)
            name = parts[0].strip()
            designation = parts[1].strip() if len(parts) > 1 else 'Faculty'
            
            name = name.replace('\u0026', '&')
            designation = designation.replace('\u0026', '&')
            
            if search_name and search_name not in name.lower():
                continue
                
            clean_name = name.replace('Dr.', '').replace('Mr.', '').replace('Mrs.', '').replace('Ms.', '').strip()
            name_parts = clean_name.split()
            significant_parts = [p for p in name_parts if len(p) > 3]
            
            my_achievements = []
            for a in achievements_pool:
                if significant_parts:
                    longest_part = max(significant_parts, key=len)
                    if longest_part.lower() in a.lower():
                        clean_achievement = a.replace('\u0026', '&').replace('\\"', '"')
                        if clean_achievement not in my_achievements:
                            my_achievements.append(clean_achievement)
                
            faculty_list.append({
                'name': name,
                'designation': designation,
                'department': dept.upper(),
                'email': f'{clean_name.lower().replace(" ", ".")}@rajalakshmi.edu.in',
                'experience': 'N/A',
                'achievements': my_achievements
            })
            
        faculty_list.sort(key=lambda x: x['name'])
        
        return jsonify({'faculty': faculty_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
        
    msg = data.get('message', '').lower()
    
    # Here you can connect a real LLM like OpenAI or Gemini.
    # For now, we process the text with basic NLP rules on the backend.
    if 'hello' in msg or 'hi' in msg:
        response = "Hello there! I'm Aadhi, processing your request from the backend. Are you looking for a specific faculty member?"
    elif 'department' in msg or 'dept' in msg:
        response = "We have faculty details for CSE, IT, ECE, EEE, MECH, CIVIL, and AIDS. Use the dropdown above to filter."
    elif 'vani' in msg:
        response = "Dr. Chettiyar Vani Vivekanand is a Professor in the CSE department. Search 'Vani' in the search bar to see her profile!"
    elif 'thank' in msg:
        response = "You're very welcome! Let me know if there's anything else."
    elif 'who are you' in msg:
        response = "I am Aadhi AI, your intelligent assistant built to help you navigate Rajalakshmi Engineering College's faculty directory."
    else:
        response = "I'm an AI assistant running on the backend! I'm still learning, but you can try searching for faculty names or departments above."
        
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
