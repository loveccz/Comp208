import sqlite3
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import os

# 示例函数，稍作修改以适配数据库操作
def read_epub_file(epub_file_path):
    book = epub.read_epub(epub_file_path)
    titles = book.get_metadata('DC', 'title')
    title = titles[0][0] if titles else 'Unknown'
    creators = book.get_metadata('DC', 'creator')
    author = creators[0][0] if creators else 'Unknown'
    content = ""
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            soup = BeautifulSoup(item.content, 'html.parser')
            cleaned_content = soup.get_text(separator=' ', strip=True)
            content += cleaned_content + ' '
    return title, author, content


# 定义包含EPUB文件的目录路径
epub_directory_path = "static/bibi-bookshelf"

# 使用os.listdir和os.path.join获取所有EPUB文件的完整路径
epub_file_paths = [os.path.join(epub_directory_path, f) for f in os.listdir(epub_directory_path) if f.endswith('.epub')]

# 遍历EPUB文件，读取数据并存入数据库
for epub_file_path in epub_file_paths:
    title, author, content = read_epub_file(epub_file_path)
    cursor.execute("INSERT INTO books (title, author, content) VALUES (?, ?, ?)", (title, author, content))

conn.commit()
conn.close()