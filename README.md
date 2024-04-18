NovelCube
================================================================================================================================

A novel reader on your phone.



Summary
--------------------------------------------------------------------------------------------------------------------------------

Online novel reading software based on JavaScript + Python + Intelligent recommendation algorithm (front end separation +Html+CSS+JavaScript+Jquery+Flask+Sqlite+ third-party open source reading software Bibi+)


### Operating environment
*Html5, JavaScript>=ES12, Jquery>=1.9.1, Python>=3.9.13


### Development kits
*Front end: VSCode/WebStorm.etc
*Back end: Pycharm
*Database:DB Browser/MySQL WorkBench


### Function declaration
*The functions of this system include: common client login registration, novel reading, classification, bookmarking, chapter, comment. Novel search, collection, reading history, intelligent recommendations. Backstage maintenance, shelving, editing.
*The recommendation algorithm uses user-based collaborative filtering recommendation. Canopy+k-means hybrid clustering is used to classify users, and cosine is used to calculate the similarity between users. Books collected by similar users are recommended to complete the recommendation.



How to Arrange Development Environment
--------------------------------------------------------------------------------------------------------------------------------

### Arrangements
*Installation and configuration front end environment
1--From the Visual Studio Code website (https://code.visualstudio.com) to download and install the latest version
2--Install all the necessary dependencies using the npm command line (Node.js package manager) and launch the reader software.
npm install jquery@1.9.1
npm start 
3--Use Chrome, firefox or Edge to view the site

*Installation and configuration back end environment
1--From the Pycharm website (https://www.jetbrains.com/pycharm/) to download and install the latest version
2--Install the required package
-pip install Flask
-pip install Flask-SQLAlchemy
-pip install Werkzeug
-pip install EbookLib
-pip install beautifulsoup4
-pip install SQLAlchemy
-pip install numpy
-pip install pandas
-pip install scikit-learn
-pip install matplotlib
-pip install xlwt
3--Run main.py, then using chorme, firefox browser or Edge access to the http://127.0.0.1:5000/index.html website.

*About bibi
turn to 'static/bibi/Readme.md'


Version number
--------------------------------------------------------------------------------------------------------------------------------
*1.0.00 (4/17/2024)



Technical support personnel and contact information
--------------------------------------------------------------------------------------------------------------------------------
*qazwsx886jrm@gmail.com