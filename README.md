hostr
=====

Great for testing quick HTML code.  

A simple web server for the current working directory.  Used for hello world style web sites hosting only files in current directory structure.

Watches directory structure and restarts server on file changes.  


Installation
------------

Run the following

	npm install hostr -g

Use
---

Run the following command to host the current working directory

	hostr
	
A simple web server will be hosted at 

	http://localhost:3000

To host at a different port use the command

	PORT=8080 hostr
