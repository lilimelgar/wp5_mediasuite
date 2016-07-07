# L A B O

LABO is the web environment where one can experiment with different labs and apis developed in the context of the Sound & Vision labs, which is executed by the R & D department.

* Version: 0.1

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


### Javascript / React components

Now that the webserver is setup, it is necessary to obtain and build all of the required Javascript packages.

Probably we will completely get rid of bower, since we are focussing on the combination:

* [npm](https://www.npmjs.com/)
* [Webpack](https://webpack.github.io/)
* [Babel](https://babeljs.io/)

Anyway, now it is still necessary to install some packages via bower, by going into the /src/static directory and running:

```
bower install
```

If you want to work on the components and want the advanced stuff of the website working, do the following:

#### Install npm

If you haven't already first install npm. Then go into the root dir of the project (containing package.json) and run:

```
npm install
```

Note: You might need to be sudo for this.

#### Start the webpack watcher

The watcher makes sure the CLARIAH component library is built/updated in /src/static/public/bundle.js
For this, the watcher reacts to any changes made in the /src/static/app folder, which contains the CLARIAH library code.

To start the watcher, go into the root dir of the project (containing webpack.config.js) and run:

```
npm run dev
```

Note: this is not a default command of npm, but works because a script (calling webpack) has been configured for this in package.json.

#### Start the compass watcher

LABO Uses the [SASS]() CSS precompiler to generate the main stylesheet (main.css), so whenever you want to change the overall styling, start the compass watcher by going into the /src/static folder followed by running:

```
compass watch
```

While the watcher is running any changes to the *.scss files in the /static/sass folder will be compiled into /static/css/main.css

### CLARIAH component library

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



### Who do I talk to? ###

* Jaap Blom, Marijn Koolen