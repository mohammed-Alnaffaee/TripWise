TripWise 🌍✈️  
TripWise is a trip-planning web application that helps users create and manage their travel plans.  
This project uses Node.js, MySQL, and HTML/CSS/JS.

🚀 Installation & Setup Guide

Step 1: Clone the Repository  
Open your terminal and run:

git clone https://github.com/mohammed-Alnaffae/TripWise.git

Then:

cd TripWise/tripwise-restructured/server

npm install


Step 2: Prepare the Database (MySQL)

1. Start your MySQL server.
2. Create a database named: tripwise
3. Import the project SQL file into the tripwise database (if provided).
4. Make sure the database settings in `server.js` are:

   host: localhost  
   user: root  
   password: your MySQL password  
   database: tripwise


Step 3: Run the Server  

From the same folder:

node server.js


Step 4: Access the Application  

Open your web browser and go to:

http://localhost:3000
