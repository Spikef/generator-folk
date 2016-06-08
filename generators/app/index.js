'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var fs = require('fs-arm');

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this.option('plugin');
    this.option('theme');
  },

  initializing: function () {
    this.options.plugin = !!this.options.plugin;
    this.options.theme = !this.options.plugin;
    this.mark = this.options.theme ? 'theme' : 'plugin';

    this.target = process.cwd();
  },

  prompting: function () {
    this.log('Welcome to the divine ' + chalk.red('generator-folk') + ' generator!');

    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Your ' + this.mark + ' name: ',
        default: this.appname
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description: ',
        default: this.appname
      },
      {
        type: 'input',
        name: 'username',
        message: 'Your name: ',
        default: this.user.git.name(),
        store: true
      },
      {
        type: 'input',
        name: 'email',
        message: 'Your email: ',
        default: this.user.git.email(),
        store: true
      },
      {
        type: 'input',
        name: 'url',
        message: 'Your website: ',
        store: true,
        default: ''
      },
      {
        type: 'input',
        name: 'homepage',
        message: 'Project\'s homepage: ',
        store: true,
        default: ''
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var appname = this.props.name;

    if (path.basename(this.target) !== appname) {
      this.target = path.resolve(this.target, appname);
    }
    
    var target = this.target;
    var source = this.sourceRoot();
    var packet = this.fs.readJSON(path.resolve(source, 'package.json'));

    if (fs.existsSync(target) && fs.readdirSync(target).length) {
      this.error = 'The target folder is not empty!';
      return;
    }else{
      fs.copySync(path.resolve(source, this.mark), target, true);
    }

    packet.name = appname;
    packet.description = this.props.description;
    packet.author.name = this.props.username;
    packet.author.email = this.props.email;
    packet.author.url = this.props.url;
    packet.homepage = this.props.homepage;

    if (this.options.theme) {
      packet.plugins = {};
    }else{
      packet.control = {
        name: 'Control',
        icon: 'fa-plug',
        pages: appname
      }
    }

    fs.writeFileSync(path.resolve(target, 'package.json'), JSON.stringify(packet, null, 4));

    var resolve = function () {
      var args = [target].concat(Array.prototype.slice.call(arguments));
      return path.resolve.apply(path, args);
    }
    if (this.options.plugin) {
      fs.rename(resolve('assets/css/demo.css'), resolve('assets/css/' + appname + '.css'));
      fs.rename(resolve('assets/js/demo.js'), resolve('assets/js/' + appname + '.js'));
      fs.rename(resolve('scripts/demo.js'), resolve('scripts/' + appname + '.js'));
      fs.rename(resolve('views/demo.ejs'), resolve('views/' + appname + '.ejs'));

      var table = fs.readFileSync(resolve('table.json'), 'utf8');
      table = table.replace(/demo/g, appname);
      fs.writeFileSync(resolve('table.json'), table);
    }
  },

  end: function () {
    if (this.error) {
      this.log(chalk.red('Faild to create the app:'));
      this.log(chalk.cyan(chalk.bold(this.error)));
    }else{
      this.log(chalk.green('Successfully initialized the app at:'));
      this.log(chalk.cyan(chalk.bold('[' + this.target + ']')));
    }
  }
});
