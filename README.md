# L A B O

LABO is the web environment where you can experiment with different functionalities and APIs developed in the context of Sound & Vision labs, developed by the R&D department of [The Netherlands Institute for Sound and Vision](http://www.beeldengeluid.nl/).

Underlying LABO's user interface, is the CLARIAH component library, which is also part of this code base.

**Current version**: 0.0.9

## CLARIAH component library

In CLARIAH the choice was made to steer clear from implementing monolithic tools and instead to focus on the implementation of
reusable functionalities, which can be:

* Services exposed by an API, such as the speech2text API, the search & collection API, etc
* UI components, such as a facet search component an LOD browser (DIVE) or visualisations such as different charts or graphs.
* Other t.b.d.

Next to functionalities CLARIAH has coined the term 'recipe' when talking of a certain combination of aforementioned functionalities.
Aiming for a high flexibility in assembling recipes CLARIAH aims to:

* Recreate the existing tools by creating a recipe for each tool
* Create new recipes/tools for use-cases/users that were previously not serviced
* Expand/improve the available ingredients (functionalities) together with third parties


## How do I get set up?

### Flask webserver (Python)

This project runs on Python 2.7

The best practice is to create a virtualenv and subsequently run:

```
pip install -r requirements.txt
```

This way all the necessary Python packages will be installed.

Now the only thing to do is to create a settings.py by copying the settings-example.py file:

```
cp settings-example.py settings.py
```

Following this it should already be possible to start the Flask webserver using

```
python server.py
```

Note: make sure you set the RECIPES_PATH correctly in your settings.py

### Javascript / React components

Now that the webserver is setup, it is necessary to obtain and build all of the required Javascript packages.

The CLARIAH component library (based on [React](https://facebook.github.io/react/)) uses the following for packaging & compiling:

* [npm](https://www.npmjs.com/)
* [Webpack](https://webpack.github.io/)
* [Babel](https://babeljs.io/)

To work on the library, do the following:

#### Install npm

If you haven't already first install [npm](https://www.npmjs.com/). Then go into /src/static (containing package.json) and run:

```
npm install
```

Note: You might need to be sudo for this.

#### Start the webpack watcher

The watcher makes sure the CLARIAH component library is built/updated in /src/static/public/assets/benglabs.js
For this, the watcher reacts to any changes made in the /src/static/app folder, which contains the CLARIAH library code.

To start the watcher, go into the /src/static (containing webpack.config.js) and run:

```
npm run dev
```

Note that this is not a default command of npm, but works because a script (calling webpack) has been configured for this in package.json.

Other commands custom commands are:

* npm run prod (webpack.config.prod.js is run to produce the minified benglabs.min.js)
* npm run build (this runs the webpack.config.js just once)

#### Start the compass watcher

LABO Uses the [SASS](http://sass-lang.com/) CSS extension language in combination with [Compass](http://compass-style.org/) to generate the main stylesheet (/src/static/css/main.css).

So, whenever you want to change the overall styling: make sure that Compass is installed, then start the compass watcher by going into the /src/static folder and running:

```
compass watch
```

While the watcher is running any changes to the *.scss files in the /static/sass folder will be compiled into /src/static/css/main.css

You can change the compass configuration by editing /src/static/config.rb

## Reading

https://docs.google.com/presentation/d/1afMLTCpRxhJpurQ97VBHCZkLbR1TEsRnd3yyxuSQ5YY/edit#slide=id.p

## Who do I talk to? ###

* Jaap Blom, Marijn Koolen