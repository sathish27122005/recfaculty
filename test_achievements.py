import re
html = open('scratch.html', 'r', encoding='utf-8', errors='ignore').read()
srcs = re.findall(r'src=\\?\"([^\"]+)\\?\"', html)
hrefs = re.findall(r'href=\\?\"([^\"]+)\\?\"', html)
urls = re.findall(r'(https?://[^\s\"\'\\]+)', html)

print('SRCS:', srcs[:5])
print('HREFS:', hrefs[:5])
print('URLS:', urls[:10])

# check for any image-like urls
imgs = [u for u in urls if '.jpg' in u.lower() or '.png' in u.lower() or 'image' in u.lower()]
print('IMGS:', imgs[:10])
