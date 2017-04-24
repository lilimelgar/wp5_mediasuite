# MEDIA SUITE (CLARIAH)


## How do I get set up?

### Dependancies

The CLARIAH media suite is roughly made up of these two main parts:

* Server: Flask (Python) webserver
* Client: The [component library](https://github.com/beeldengeluid/labo-components)


To function properly the media suite requires access to running instances of each of the following APIs:

* The [search API](https://github.com/beeldengeluid/labs-search-api) (private repo)
* The [annotation API](https://github.com/beeldengeluid/labs-annotation-api) (private repo)

'''Note''': In order to get access to one of these, please contact the owner of this repository

### The webserver

This project runs on Python 2.7 and uses [Flask](http://flask.pocoo.org/) to serve the web content

The best practice is to create a virtualenv and subsequently run:

```
pip install -r requirements.txt
```

This way all the necessary Python packages (including Flask) will be installed.

Now the only thing to do is to create a settings.py by copying the settings-example.py file:

```
cp settings-example.py settings.py
```

Following this it should already be possible to start the Flask webserver using

```
python server.py
```

'''Note''': check the comments in settings-example.py on how to completely configure the media suite

### Client application

Now that the webserver is setup, it is necessary to obtain all of the required Javascript packages. The main package is the [labo-components](https://github.com/beeldengeluid/labo-components) library maintained by Beeld en Geluid, which contains all of the web components that are used for building the different apps (a.k.a. recipes) within the media suite.

Make sure [npm](https://www.npmjs.com/) is installed, then go into /src/static (containing package.json) and run:

```
npm install
```

Note: You might need to be sudo for this.


#### Styling the media suite

Currently [SASS](http://sass-lang.com/) and [Compass](http://compass-style.org/) are used to generate the main stylesheet (/src/static/css/main.css).

Whenever you want to change the overall styling: make sure that Compass is installed, then start the compass watcher by going into the /src/static folder and running:

```
compass watch
```

While the watcher is running any changes to the *.scss files in the /static/sass folder will be compiled into /src/static/css/main.css

You can change the Compass configuration by editing /src/static/config.rb


## Who do I talk to? ###

* Jaap Blom