hostr
=====

Great for testing quick HTML code.  

A simple web server for the current working directory.  Used for hello world style web sites hosting only files in current directory structure.

Watches directory structure and restarts server on file changes.  Includes integration with [LiveReload](http://livereload.com/).  



Installation
------------

Run the following

	npm install hostr -g


Use
---

Run the following command to host the current working directory

	cd project/my_development_project
	hostr
	
A simple web server will be hosted at 

	http://localhost:3000

To host at a different port, set the PORT environment variable.  

	PORT=8080 hostr


LiveReload
----------

LiveReload is used for development.  Hostr monitors your files.  When a file save occurs LiveReload communicates with your site and pushes a refresh to your browser (e.g. - iPhone/Android/Blackberry, Desktop-Chrome/IE/Safari) so that your changes are immediately visible.  

Communication between Hostr and LiveReload occur through WebSockets.  You must use a WebSocket enabled browser.  

To use LiveReload ([additional instructions](http://feedback.livereload.com/knowledgebase/articles/86180-how-do-i-add-the-script-tag-manually-)): 

	<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>

Then run Hostr and when file changes are detected your browser will refresh.  

	cd project/my_development_project
	hostr



Contribute
----------

If you've got ideas on how to make hostr better create an issue and mark an enhancement in Github.  



License
-------

Copyright (c) 2014 Henry Tseng

Released under the MIT license. See LICENSE for details.