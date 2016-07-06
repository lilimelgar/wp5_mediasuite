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

1. Install npm by going into the root dir of the project (containing package.json) and running

```
npm install
```

Note: You might need to be sudo for this.

2. Start the webpack watcher (in the root dir, which also contains webpack.config.js) by running:

```
npm run dev
```

While the watcher is running, the /src/static/bundle.js is automatically built whenever you change any sources in the /static/app folder, which contains the reusable (UI) components, based on the React framework. The following section explains a bit about the underlying ideas of these components.


### UI Component structure

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