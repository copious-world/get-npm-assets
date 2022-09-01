# get-npm-assets
 
This is a node.js program that can be call from the command line as such:

```
get-npm-assets my-npm-package-bin-command
```

Also, it can be called as such:

```
get-npm-assets my-npm-package-name
```

**The result:**
> If the package is compatible, this will move template files, as well as other files, to the directory where the command is used. The files may be such things as config files, images, key templates, or any other thing the package or program needs to run when called from the local directory.

The packages have to be installed globaly. For example: 

```
npm install -g my-npm-package-name
```

So, when you use this package, your directory might be empty at first:

```
$ls
. ..
```

But, then use some compatible package name or npm installed command line program name as a parameter to **get-npm-assets**:

```
$get-npm-assets copious-users
$ls
. .. relay-service.conf
```

Before using **get-npm-assets**, the program might crash or run in a way that is not too useful. After running the program, you can run it more successfully. You might even change the assets to better suit your needs. Here is an example of how to call the program with the asset that you might havejust gotten:

```
$copious-users relay-service.conf
```

The program should start up. Of course, for the program in the example, its networking will be bound to the local host. So, you might have to fix the .conf file to make the program accessible on your LAN. In general, the npm package providing assets by way of this tool will be giving examples and templates to get you started. 

## installation

In order to install the package, use npm:

```
npm install -g get-npm-assets
```

Currently, this runs on Linux and other Unix like OSs such as BSD for the MacOs.

## Making a compatible package


There are three ways **get-npm-assets** finds files for the package or program. One of the ways, a map, is best for programs, but may be useful for packages.

Here are the three ways:

* **\*.config** files in the top level directory of the package
* a single **asset-map.json** file in the top level directory of the package
* an **assets** directory with any files in it

The program **get-npm-assets** uses only one of these options. (**uses only one option**). It looks for an option in this order:

1. It looks for the asset map
2. If there is no asset map, it looks for the asset directory
3. Finally, it looks for \*.conf files.
4. If nothing is found, it will do nothing

The program **get-npm-assets** looks in the global **bin** directory for the parameter. Then it looks in the global **node_modules** directory. So, if your package has a bin/*script* with same name as the package, it will still look in the package directory just as if there were no bin/*script* files. But, if the package installs scripts in the bin directory with different names, **get-npm-assets** will figured the directory from the alias link to the scripts in the package directory.

Here is the order it looks for the parameter on the command line:

1. It looks for the symbol in the **bin** directory used by npm global
2. It looks int the node_modules directory use by npm global

Some package release more than one bin/*script* file. For instance, when it comes to the [copious.world](http://www.copious.world) package [copious-endpoints](https://www.npmjs.com/package/copious-endpoints), three scrips are placed in the **bin** directory.

In the following is a snippet of the package.json file that installs the scripts when you run the following command:

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

So, the example above shows how to get a version of the file relay-service.conf. In order to get the \*.conf file that you want for a particular copious-endpoints program, the packge **copious-endpoints** has a map file that identifies which *.conf file to copy to the local directory. Here is a version of the file, **asset-map.json**: 

```
{
    "copious-contacts" : "contact-service.conf",
    "copious-user" : "relay-service.conf"
}
```

It might be that the project will do a post install. But, even in this simple case, the post install script can't make an assumption as to which command will be used for the application project. 

In simpler projects that use just one command or that are just library components, the post install script could call the command install by this package **asset-map.json**. It might be easier to specify instead of a lot of script lines. 

Of course, the package might have had an assets directory with a number o files in it. In that case, an assets diretory is made in the calling directory and files are copied into the new assets directory from the package.

### Once again

#### Leave \*.conf files lying around in the npm package top level directory

All of the \*.conf files are copied to the current directory

#### use an asset-map.json file

The JSON object top level keys should be the names of scripts that are installed in the bin directory when the package is installed

#### Use an asset directory

This option results in an assets directory being created in the current working directory.

## Enjoy

This program is new. So, there might be confusing things. You can always use the issues on github.

This program is known to run on LINUX or BSD. It uses bash commands, and will likely not perform on Windows. (perhaps in another verion).




