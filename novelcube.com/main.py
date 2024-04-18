from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import sqlite3
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import os
import random
import re
from sqlalchemy.exc import IntegrityError


from itsdangerous import URLSafeTimedSerializer, SignatureExpired


app = Flask(__name__)
app.config['SECRET_KEY'] = 'a-very-secret-key'  # Add a secret key for session management
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///table.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'  # 安全关键字，用于维持会话的安全
db = SQLAlchemy(app)



##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

#在应用中定义模型，这些模型将映射到数据库中的表。
class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        email = db.Column(db.String(120), unique=True, nullable=False)
        full_name = db.Column(db.String(100), nullable=False)
        mobile_number = db.Column(db.String(20), nullable=False)
        username = db.Column(db.String(100), unique=True, nullable=False)
        picid = db.Column(db.Integer, nullable=True)
        password_hash = db.Column(db.String(128))

        def set_password(self, password):
            self.password_hash = generate_password_hash(password)


##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

# 定义评论模型
class Comment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        content_id = db.Column(db.Integer, nullable=False)  # 这是评论对应的内容的ID，比如书籍的ID
        text = db.Column(db.Text, nullable=False)
        timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

        user = db.relationship('User', backref='comments')


    # 添加评论路由
@app.route('/add_comment', methods=['POST'])
def add_comment():
        if 'user_id' in session:
            user_id = session['user_id']
            content_id = request.form.get('content_id')  # 你需要在前端表单中有一个隐藏的输入字段来存储内容ID
            text = request.form.get('comment')

            # 创建新评论对象
            new_comment = Comment(user_id=user_id, content_id=content_id, text=text)

            # 保存到数据库
            db.session.add(new_comment)
            db.session.commit()

            flash('Comment added successfully.')
            return redirect(url_for('the_content_route', content_id=content_id))  # 重定向回内容页面
        else:
            flash('You need to login to comment.')
            return redirect(url_for('login'))

##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    epub = db.Column(db.Integer,nullable=False)
    title = db.Column(db.String(250), nullable=False)
    author = db.Column(db.String(250), nullable=True)
    content = db.Column(db.Text, nullable=True)
    category_1 = db.Column(db.String(250), nullable=True)
    category_2 = db.Column(db.String(250), nullable=True)
    category_3 = db.Column(db.String(250), nullable=True)
    category_4 = db.Column(db.String(250), nullable=True)
    Update_time = db.Column(db.String(250), nullable=True)
    Update_chapter = db.Column(db.String(250), nullable=True)

# 定义包含EPUB文件的目录路径
epub_directory_path = "static/bibi-bookshelf"

# 使用os.listdir和os.path.join获取所有EPUB文件的完整路径
epub_file_paths = [os.path.join(epub_directory_path, f) for f in os.listdir(epub_directory_path) if f.endswith('.epub')]

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

# 书籍导入逻辑
def import_books_to_db(directory):
    with app.app_context():
      for filename in os.listdir(directory):
        if filename.endswith('.epub'):
            epub = int(filename[2:-5])
            epub_file_path = os.path.join(directory, filename)
            title, author, content = read_epub_file(epub_file_path)

            book = Book.query.filter_by(title=title).first()
            if book is None:
                  book = Book(epub=epub, title=title, author=author, content=content)
                  db.session.add(book)
        db.session.commit()


##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

class UserBookshelf(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), primary_key=True)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('bookshelf', lazy='dynamic'))
    book = db.relationship('Book', backref=db.backref('bookshelf_entries', lazy='dynamic'))

@app.route('/add_to_bookshelf/<int:book_id>', methods=['POST'])
def add_to_bookshelf(book_id):
        if 'user_id' not in session:
            flash('You need to log in first.')
            return redirect(url_for('login'))
        else:
            user_id = session['user_id']
            # 检查书籍是否已经在用户的书架上
            entry = UserBookshelf.query.filter_by(user_id=user_id, book_id=book_id).first()
            if entry is not None:
                flash('The book is already on your bookshelf.')
                return redirect(request.referrer)
            else:
              # 添加书籍到书架
              new_entry = UserBookshelf(user_id=user_id, book_id=book_id)
              db.session.add(new_entry)
              db.session.commit()
              flash('Book added to your bookshelf.')
              return redirect(request.referrer)

@app.route('/remove_from_bookshelf/<int:book_id>', methods=['POST'])
def remove_from_bookshelf(book_id):
    if 'user_id' not in session:
        flash('You need to log in first.')
        return redirect(url_for('login'))

    user_id = session['user_id']
    # 在数据库中找到并删除书本记录
    entry = UserBookshelf.query.filter_by(user_id=user_id, book_id=book_id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()
        flash('Book has been removed from your bookshelf.')
    else:
        flash('Book was not found on your bookshelf.')

    return redirect(url_for('bookshelves'))


##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

class HistoryBookshelf(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'))
    read_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('reading_history', lazy='dynamic'))
    book = db.relationship('Book', backref=db.backref('read_by', lazy='dynamic'))

@app.route('/add_to_history/<int:book_id>', methods=['POST'])
def add_to_history(book_id):
    if 'user_id' not in session:
        flash('You need to log in first.')
        return redirect(url_for('login'))
    else:
        user_id = session['user_id']
        # 直接添加书籍到阅读历史，即使它已经存在
        new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book_id)
        db.session.add(new_history_entry)
        db.session.commit()
        flash('Book added to your reading history.')
        return redirect(request.referrer)


##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################
##########################################################################################

# 连接到数据库并创建一个搜索函数
def search_db(search_query):
    conn = sqlite3.connect('instance/table.db')
    cur = conn.cursor()
    search_query = f"%{search_query}%"
    cur.execute("""
            SELECT id, epub, title, author, category_1, category_2, Update_time, Update_chapter
            FROM book
            WHERE title LIKE ? OR author LIKE ?
        """, (search_query, search_query))
    results = [
        {
            'id': row[0], 'epub': row[1], 'title': row[2], 'author': row[3],
            'category_1': row[4], 'category_2': row[5],
            'Update_time': row[6], 'Update_chapter': row[7]
        }
        for row in cur.fetchall()
    ]
    conn.close()
    return results




@app.route('/search', methods=['GET'])
def search():
    search_query = request.args.get('query', '')
    results = search_db(search_query)  # 假设这个函数返回搜索结果
    return render_template('search_results.html', results=results)


# 使用变量规则处理所有的书本详细页面
@app.route('/info/<int:epub>', methods=['GET', 'POST'])
def book_detail(epub):
    # 获取对应epub值的书籍
    book = Book.query.filter_by(epub=epub).first_or_404()

    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=book.id, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        # 重定向回当前书籍的详情页
        return redirect(url_for('book_detail', epub=book.epub))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=book.id).order_by(Comment.timestamp.desc()).all()
    # 使用一个统一的模板来显示书籍详情
    template_name = f'info/pg{epub}.html'
    return render_template(template_name, book=book, comments=comments)

########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################

@app.route('/read/<book_id>')
def read_book(book_id):
    epub_file_url = f'bibi-bookshelf/{book_id}.epub'  # 构造 EPUB 文件的 URl
    return render_template('read_book.html', epub_file_url=epub_file_url, book_id=book_id)


########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################

    #SighUp
@app.route('/signup.html', methods=['GET', 'POST'])
def signup():
        if request.method == 'POST':
            # 从表单中获取数据
            email = request.form.get('email')
            full_name = request.form.get('full_name')
            mobile_number = request.form.get('mobile_number')
            username = request.form.get('username')
            password = request.form.get('password')  # 确保前端表单有一个 name="password" 的输入字段

            # 至少需要8位数
            if len(password) < 8 or not re.search("[a-zA-Z]", password) or not re.search("[0-9]", password):
                flash('Password must be at least 8 characters long with at least one letter and one number.')
                return redirect(url_for('signup'))

            # 检查用户是否已经存在
            user = User.query.filter_by(email=email).first()
            if user:
                flash('Email already registered.')
                return redirect(url_for('signup'))

            # 检查用户名是否已经存在
            if User.query.filter_by(username=username).first():
                flash('Username already taken.')
                return redirect(url_for('signup'))

            #头像
            random_picid = random.randint(1, 5)

            new_user = User(
                email=email,
                full_name=full_name,
                mobile_number=mobile_number,
                username=username,
                picid=random_picid  # 将随机生成的 picid 赋值给用户
            )
            new_user.set_password(password)


            # 添加用户到数据库
            db.session.add(new_user)
            try:
                db.session.commit()
                flash('User registered successfully.')
                return redirect(url_for('login'))
            except IntegrityError as e:
                db.session.rollback()
                flash('An error occurred while registering the user.')
                app.logger.error(f'IntegrityError: {e}')
                return redirect(url_for('signup'))

        # 对于 GET 请求，渲染注册表单
        return render_template('signup.html')



    # 忘记密码路由
@app.route('/forgot.html', methods=['GET', 'POST'])
def forgot_password():
        if request.method == 'POST':
            email = request.form.get('email_or_phone')  # 注意这里获取的字段要和你的表单中的name属性一致
            user = User.query.filter_by(email=email).first()
            if user:
                # 用户存在于数据库中，跳转到重置密码页面，并传递用户ID
                return redirect(url_for('reset_password', user_id=user.id))
            else:
                flash('Email does not exist.')

        return render_template('forgot.html')



    # 重置密码路由
@app.route('/reset/<int:user_id>', methods=['GET', 'POST'])
def reset_password(user_id):
        # 在实际生产环境中，应该加入更多的验证来保证安全性
        user = User.query.get(user_id)
        if not user:
            flash('Invalid user.')
            return redirect(url_for('forgot'))

        if request.method == 'POST':
            new_password = request.form.get('new_password')
            confirm_password = request.form.get('confirm_password')

            if new_password != confirm_password:
                flash('Passwords do not match.')
                return redirect(url_for('reset_password', user_id=user_id))

            # 重置密码
            user.set_password(new_password)
            db.session.commit()
            flash('Your password has been updated.')
            return redirect(url_for('login'))

        # 对于 GET 请求，我们只需呈现表单
        return render_template('reset_password.html', user_id=user_id)



    # 登录路由
@app.route('/login.html', methods=['GET', 'POST'])
def login():
        if request.method == 'POST':
            email = request.form.get('email')
            password = request.form.get('password')

            # 检查用户是否存在以及密码是否正确
            user = User.query.filter_by(email=email).first()
            if user and check_password_hash(user.password_hash, password):
                # 密码匹配，设置用户的会话
                session['user_id'] = user.id

                flash('Logged in successfully.')
                return redirect(url_for('index'))  # 重定向到用户的dashboard或另一个页面
            else:
                flash('Invalid email address or password.')

        # 如果请求方法是GET或者验证未通过，渲染登录页面
        return render_template('login.html')

@app.route('/logout')
def logout():
    # 清除会话中的所有信息
    session.clear()
    flash('You have been logged out.')
    # 重定向到登录页面或者主页
    return redirect(url_for('login'))

########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
@app.route('/index.html')
def index():
        # 确保用户已经登录
        if 'user_id' not in session:
            flash('You need to login first.')
            return redirect(url_for('login'))

        # 渲染dashboard页面
        return render_template('index.html')




@app.route('/latest.html')
def latest():
        return render_template('latest.html')



@app.route('/rank.html')
def rank():
        return render_template('rank.html')


@app.route('/bookshelves.html')
def bookshelves():
    # 确保用户已经登录
    if 'user_id' not in session:
        flash('You need to login first.')
        return redirect(url_for('login'))

    user_id = session['user_id']
    # 查询用户的书架信息
    bookshelf_entries = UserBookshelf.query.filter_by(user_id=user_id).order_by(UserBookshelf.added_at.desc()).all()

    return render_template('bookshelves.html', bookshelf_entries=bookshelf_entries)

@app.route('/my.html')
def my_page():
    if 'user_id' in session:
        # 假设您在登录时设置了 user_id
        user_id = session['user_id']
        user = User.query.get(user_id)
        if user:
            username = user.username
            userpic = user.picid
        else:
            username = None  # 或者可以选择重定向到登录页面

    return render_template('my.html', username=username, userpic=userpic)

@app.route('/reading.html')
def reading():
    return render_template('reading.html')


@app.route('/accinfo.html')
def accinfo():
    # Get the user id from the session
    user_id = session.get('user_id')

    # Query the user from the database using user_id
    user = User.query.get(user_id)
    if user is None:
        # Handle the case where there is no such user
        flash('You must be logged in to view this page.')
        return redirect(url_for('login'))

    # Pass the user details to the template
    return render_template('accinfo.html', user=user)

@app.route('/idea.html')
def idea():
    return render_template('idea.html')

@app.route('/history_bookshelf.html')
def history():
    # 确保用户已经登录
    if 'user_id' not in session:
        flash('You need to login first.')
        return redirect(url_for('login'))

    user_id = session['user_id']
    # 查询用户的书架信息
    bookshelf_entries = HistoryBookshelf.query.filter_by(user_id=user_id).order_by(HistoryBookshelf.read_at.desc()).all()
    # 为了显示书籍详细信息，我们需要从 Book 表中查询每本书
    return render_template('history_bookshelves.html', bookshelf_entries=bookshelf_entries)

########################################################################################
########################################################################################
########################################################################################
############################### pg route################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
########################################################################################
############################### pg route################################################
########################################################################################
########################################################################################
########################################################################################

# Flask 路由设置
@app.route('/i203.html')
def i203():
    return render_template('ideas/i203.html')

@app.route('/i2416.html')
def i2416():
    return render_template('ideas/i2416.html')

@app.route('/info/pg203', methods=['GET', 'POST'])
def pg203():
    book = Book.query.filter_by(epub=203).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        # 处理评论提交
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=203, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg203'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    # 显示页面和评论
    comments = Comment.query.filter_by(content_id=203).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg203.html', comments=comments, book=book)

@app.route('/info/pg2416', methods=['GET', 'POST'])
def pg2416():
    book = Book.query.filter_by(epub=2416).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=2416, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg2416'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=2416).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg2416.html', comments=comments, book=book)

@app.route('/info/pg2429', methods=['GET', 'POST'])
def pg2429():
    book = Book.query.filter_by(epub=2429).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=2429, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg2429'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=2429).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg2429.html', comments=comments, book=book)

@app.route('/info/pg2433', methods=['GET', 'POST'])
def pg2433():
    book = Book.query.filter_by(epub=2433).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=2433, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg2433'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=2433).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg2433.html', comments=comments, book=book)


@app.route('/info/pg2600', methods=['GET', 'POST'])
def pg2600():
    book = Book.query.filter_by(epub=2600).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=2600, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg2600'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=2600).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg2600.html', comments=comments, book=book)

@app.route('/info/pg3072', methods=['GET', 'POST'])
def pg3072():
    book = Book.query.filter_by(epub=3072).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=3072, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg3072'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=3072).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg3072.html', comments=comments, book=book)


@app.route('/info/pg8801', methods=['GET', 'POST'])
def pg8801():
    book = Book.query.filter_by(epub=8801).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=8801, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg8801'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=8801).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg8801.html', comments=comments, book=book)

@app.route('/info/pg24315', methods=['GET', 'POST'])
def pg24315():
    book = Book.query.filter_by(epub=24315).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=24315, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg24315'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=24315).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg24315.html', comments=comments, book=book)

@app.route('/info/pg24316', methods=['GET', 'POST'])
def pg24316():
    book = Book.query.filter_by(epub=24316).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=24316, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg24316'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=24316).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg24316.html', comments=comments, book=book)

@app.route('/info/pg35013', methods=['GET', 'POST'])
def pg35013():
    book = Book.query.filter_by(epub=35013).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=35013, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg35013'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=35013).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg35013.html', comments=comments, book=book)

@app.route('/info/pg42532', methods=['GET', 'POST'])
def pg42532():
    book = Book.query.filter_by(epub=42532).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=42532, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg42532'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=42532).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg42532.html', comments=comments, book=book)

@app.route('/info/pg46547', methods=['GET', 'POST'])
def pg46547():
    book = Book.query.filter_by(epub=46547).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=46547, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg46547'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    comments = Comment.query.filter_by(content_id=46547).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg46547.html', comments=comments, book=book)

@app.route('/info/pg47903', methods=['GET', 'POST'])
def pg47903():
    book = Book.query.filter_by(epub=47903).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        # 处理评论提交
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=47903, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg47903'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    # 显示页面和评论
    comments = Comment.query.filter_by(content_id=47903).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg47903.html', comments=comments, book=book)

@app.route('/info/pg48912', methods=['GET', 'POST'])
def pg48912():
    book = Book.query.filter_by(epub=48912).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        # 处理评论提交
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=48912, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg48912'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    # 显示页面和评论
    comments = Comment.query.filter_by(content_id=48912).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg48912.html', comments=comments, book=book)

@app.route('/info/pg49372', methods=['GET', 'POST'])
def pg49372():
    book = Book.query.filter_by(epub=49372).first_or_404()
    if request.method == 'POST' and 'user_id' in session:
        # 处理评论提交
        text = request.form['comment_text']
        new_comment = Comment(user_id=session['user_id'], content_id=49372, text=text)
        db.session.add(new_comment)
        db.session.commit()
        flash('评论添加成功。')
        return redirect(url_for('pg49372'))

    # 处理GET请求，添加阅读历史
    if 'user_id' in session:
        user_id = session['user_id']
        # 检查用户的阅读历史中是否已经有这本书
        existing_history = HistoryBookshelf.query.filter_by(user_id=user_id, book_id=book.id).first()
        if not existing_history:
            # 如果没有，则添加新纪录
            new_history_entry = HistoryBookshelf(user_id=user_id, book_id=book.id)
            db.session.add(new_history_entry)
            db.session.commit()
        else:
            # 如果已存在，可以选择更新记录的时间戳
            existing_history.read_at = datetime.utcnow()
            db.session.commit()

    # 显示页面和评论
    comments = Comment.query.filter_by(content_id=49372).order_by(Comment.timestamp.desc()).all()
    return render_template('info/pg49372.html', comments=comments, book=book)



########################################################################################
########################################################################################
########################################################################################

# 设置cookie的路由,好像用不到？
@app.route('/set_cookie')
def set_cookie():
    response = make_response(redirect(url_for('index')))
    response.set_cookie('cookie_name', 'cookie_value', max_age=60*60*24*7)  # 设置cookie，持续一周
    return response

# 获取cookie的路由 好像用不到？
@app.route('/get_cookie')
def get_cookie():
    cookie_value = request.cookies.get('cookie_name', 'default_value')
    return 'Cookie value: {}'.format(cookie_value)

# 删除cookie的路由 好像用不到？
@app.route('/delete_cookie')
def delete_cookie():
    response = make_response(redirect(url_for('index')))
    response.set_cookie('cookie_name', '', expires=0)  # 删除cookie
    return response







#检查已经储存的用户
@app.route('/users', methods=['GET', 'POST'])
def get_users():
    users = User.query.all()
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'mobile_number': user.mobile_number,
            'username': user.username
        })

    return jsonify(users_data)

if __name__ == '__main__':
    # 初始化数据库
    with app.app_context():
        db.create_all()
    print(app.url_map)
    # import_books_to_db(os.path.join(app.root_path, 'static', 'bibi-bookshelf'))
    app.run(debug=True)





