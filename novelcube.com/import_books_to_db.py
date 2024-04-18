import ebooklib
from ebooklib import epub
import sqlite3
import os
from bs4 import BeautifulSoup



def read_epub_file(epub_file_path):
    book = epub.read_epub(epub_file_path)

    titles = book.get_metadata('DC', 'title')  # 获取书名
    title = titles[0][0] if titles else 'Unknown'

    creators = book.get_metadata('DC', 'creator')  # 获取作者
    author = creators[0][0] if creators else 'Unknown'
    # 初始化一个空字符串来存储内容
    content = ""

    # 遍历书籍中的每一项
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            # 使用BeautifulSoup提取并清洗HTML标签
            soup = BeautifulSoup(item.content, 'html.parser')
            cleaned_content = soup.get_text(separator=' ', strip=True)
            content += cleaned_content + ' '  # 添加空格作为段落分隔

    return title, author, content


def read_txt_file(txt_file_path):
    title = os.path.basename(txt_file_path).replace('.txt', '')  # 假设文件名作为书名
    author = "未知"  # TXT文件通常不包含作者信息
    content = ""
    encodings = ['utf-8', 'gbk', 'gb2312', 'ascii', 'latin1']
    for enc in encodings:
        try:
            with open(txt_file_path, 'r', encoding=enc) as file:
                content = file.read()
            break  # 成功读取，跳出循环
        except UnicodeDecodeError:
            print(f"Failed to decode with {enc}, trying next...")
    return title, author, content

def create_database():
    conn = sqlite3.connect('books.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS Books(
         Id INTEGER PRIMARY KEY,
         Title TEXT,
         Author TEXT,
         Content TEXT)''') #添加一个Content字段来存储书的内容
    conn.commit()
    conn.close()

def insert_book_data(title, author, content):
    conn = sqlite3.connect('books.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO Books (Title, Author,Content) VALUES (?, ?, ?)", (title, author, content))
    conn.commit()
    conn.close()

def main():
    create_database()
    book_file_path = r"C:\Users\10504\Desktop\学习\liverpool\COMP208\book\射雕英雄传.txt" #书籍路径<-----------------

    if book_file_path.endswith('.epub'):
        title, author, content = read_epub_file(book_file_path)
    elif book_file_path.endswith('.txt'):
        title, author, content = read_txt_file(book_file_path)
    else:
        print("不支持的文件格式")
        return

    insert_book_data(title, author, content)
    print("书籍导入完成！")

if __name__ == "__main__":
    main()
