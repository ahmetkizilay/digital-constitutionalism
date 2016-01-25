# digital-constitutionalism

This project generates CSV files to create a graph on Graph Commons by using the
data provided by [Towards Digital Constitutionalism? Mapping Attempts to Craft an Internet Bill of Rights](http://ssrn.com/abstract=2687120)
by Lex Gill, Dennis Redeker and Urs Gasser.

Reference table provided in the paper is copied into data folder.

### Running
```sh
npm install
node index data/data.csv
```
The program will generate `nodes.csv` and `edges.csv` files in the data folder. These files can be imported to Graph Commons [here](https://graphcommons.com/graphs/import).
