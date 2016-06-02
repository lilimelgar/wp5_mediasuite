# L A B O

LABO is the web environment where one can experiment with different labs and apis developed in the context of the Sound & Vision labs, which is executed by the R & D department.

* Version: 0.1

### How do I get set up? ###

This project runs on Python 2.7

The best practice is to create a virtualenv and subsequently run:

```
pip install -r requirements.txt
```

This way all the necessary Python packages will be installed. Following this it should already be possible to start the Flask webserver using

```
python server.py
```

Doing this will result in a not fully functional (JavaScript & CSS wise) front-end however. You still need to install the JavaScript packages by running:

```
bower install
```

in the /src/static directory.

When you intend to work on any of the UI components, make sure babelify and the react preset are installed:

```
npm install --global babel-cli
npm install babel-preset-react
```

Once this is setup, it is possible to start working on the component code in `src/static/js/ui_components_src`

Before you can test your work on these components, make sure to transpile the code using by starting the babel watcher on the ui_components directory:

```
babel --presets react src/static/js/ui_components_src --watch --out-dir src/static/js/ui_components
```

Note: the ui_components directory is part of .gitignore, since you can generate it using babel


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

LABO, the place for experimentation, currently holds the UI components being developed. After the UI components have matured enough it
should be transferred to a dedicated GitHub repository.

If you want to work on these UI components, please note the following:

* /js/ui_components_src is the folder that currently holds any code related to (reusable) CLARIAH functionalities/components
* Each component should be implemented using React (classes/components)
* /js/ui_component_src/recipe/Recipe.js is the component that knows how to 'cook the recipe', meaning it should now how to interpret your ingredient/functionality
* There are currently two 'proper' (understood by Recipe.js) components:
* * /js/ui_component_src/search/FacetSearchComponent.js
* * /js/ui_component_src/visualisations/LineChart.js



### Who do I talk to? ###

* Jaap Blom, Marijn Koolen