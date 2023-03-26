# get-npm-assets

A command line utility for copying asset files from the top level directory of a globally intalled npm package to the current working directory, the directory where the command will be invoked.

## purpose

This utility is intended to make the installation and initial usage of node.js command line utitlies a little easier. It is useful especially for cases where an example configuration file is needed for users of the command line. This allows the user to get a file to start running the program without having to get it from another web page or digging down into the npm package directory to get a copy. Often times, the example configuration can be a template that the user can change values in for his own operations. 

## installation

In order to install the package, use npm:

```
npm install -g get-npm-assets
```

Currently, this runs on Linux and other Unix like OSs such as BSD for the MacOs.

## usage
 
This is a node.js program that can be called from the command line as such:

```
get-npm-assets my-npm-package-bin-command
```

Also, it can be called as such:

```
get-npm-assets my-npm-package-name
```

**The result:**
> If the package is compatible, this will move template files, as well as other files, to the directory where the command is used. The files may be such things as config files, images, key templates, or any other things the package or program needs to run when called from the current working directory.

Compatible packages have to be installed globaly. For example: 

```
npm install -g my-npm-package-name
```

So, when you use this package, your directory might be empty at first:

```
$ls
. ..
```

But, then use some compatible package npm name or some npm installed command-line-program name as a parameter to **get-npm-assets**:

```
$get-npm-assets copious-users
$ls
. .. relay-service.conf
```

Before using **get-npm-assets**, the program might crash or run in a way that is not too useful. After running the program, you can run it more successfully. You might even change the assets to better suit your needs. Here is an example of how to call the program with the asset that you might havejust gotten:

```
$copious-users relay-service.conf
```

The program should start up. Of course, for the program in the example, its networking will be bound to the local host. So, you might have to fix the **.conf** file to make the program accessible on your LAN. In general, the npm package providing assets by way of this tool will be yielding examples and templates to get you started.

## compatible packages

This is not a list of them. This is an overview as to how to make an npm package compatible.

1. It needs to be a globally installed command line utility that is stored in the packages `<package>/bin` directory.
2. There needs to be one of three possible resources accessible from the top level of the npm package directory, the one you find in node_modules.
	1. **.conf** files at the top level of the directory will be moved to the current working directory.
	2. there can be a `<package>/assets` directory, sibling to the `<package>/bin` directory, all of whose assets will be moved to the current working directory
	3. There can be an asset-map.config file. And, this file will contain a JSON formatted object that maps the command-line names to files that should be moved to the current working directory. Relative paths will be assumed. The command line names would be the same as those in the `bin` field of the package.json file.

That is all that is needed for compatibility. 


## Making a compatible package

There are three ways **get-npm-assets** finds files for the package or program. One of the ways, a map, is best for programs, but may be useful for packages.

Here are the three ways this utility finds files:

* **\*.conf** files in the top level directory of the package
* a single **asset-map.json** file in the top level directory of the package
* an **assets** directory with any files in it

The program **get-npm-assets** uses only one of these options. (**uses only one option**). It looks for an option in this order:

1. It looks for the asset map
2. If there is no asset map, it looks for the asset directory
3. Finally, it looks for \*.conf files.
4. If nothing is found, it will do nothing

The program **get-npm-assets** looks in the global **bin** directory for the parameter. Then it looks in the global **node_modules** directory. So, if your package has a bin/*script* with same name as the package, it will still look in the package directory just as if there were no bin/*script* files. But, if the package installs scripts in the bin directory with different names, **get-npm-assets** will figure the directory from the (/bin dir) alias link to the scripts in the package directory.

Here is the order it looks for the parameters on the command line:

1. It looks for the symbol in the **bin** directory used by npm global
2. It looks in the node_modules directory used by `npm global`

Some packages release more than one bin/*script* file. For instance, when it comes to the [copious.world](http://www.copious.world) package [copious-endpoints](https://www.npmjs.com/package/copious-endpoints), three scrips are placed in the **bin** directory.

The following is a snippet of the package.json file that installs the scripts when you run the following command:

```
npm install -g copious-endpoints
```

Here is the package.json **bin** component:

```
  "bin" : {
    "copious-user" : "./bin/endpoint-user.js",
    "copious-contacts" : "./bin/endpoint-contacts.js",
    "add-mini-links" : "./bin/add-mini-links.js"
  },
```

Now, there are two command line keys, each requiring their own configuration files to run, as such:

```
$copious-users relay-service.conf
```

So, the example below shows how to get a version of the file relay-service.conf. In order to get the \*.conf file that you want for a particular copious-endpoints program, the packge **copious-endpoints** has a map file that identifies which *.conf file to copy to the local directory. Here is a version of the file, **asset-map.json**: 

```
{
    "copious-contacts" : "contact-service.conf",
    "copious-user" : "relay-service.conf"
}
```

It might be that the project will do a post install - specified in their npm file. But, even in the simple case of this example, the post install script can't make an assumption as to which command, from the bin field of package.json, will be used for the application project. So, the asset map clarifies which file to get.

Of course, the package might have had an `<package>/assets` directory with a number o files in it. In that case, an `./assets` diretory is made in the calling directory (the current working directory) and files are copied into the new assets directory from the package.

When using the asset map, if a command-line name indicates a program that needs a list of assets, it's field in **asset-map.json** may have an array value as such:

```
{
    "run-cnd" : ["run-service.conf","logo.jpg",".etc"]
}
```

Once again, each file in the list is expected to be at some offset from the module top directory under node_modules.


### Once again

#### Leave \*.conf files lying around in the npm package top level directory

All of the \*.conf files are copied to the current directory

#### use an asset-map.json file

The JSON object top level keys should be the names of scripts that are installed in the bin directory when the package is installed. And, those scripts will be listed under the `bin` field of the package.json file.

#### Use an asset directory

This option results in an assets directory being created in the current working directory.

## Enjoy

If there might be confusing things, you can always use the issues on github.

This program is known to run on LINUX or BSD. It uses bash commands.





