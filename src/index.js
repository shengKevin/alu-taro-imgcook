const nameMapping = {
  'page': 'View',
  'text': 'Text',
  'div': 'View',
  'image': 'Image',
  'block': 'View',
}
const taroifyMapping = {
  'input': 'Input',
  'upload': 'Upload',
  'radiogroup': 'RadioGroup',
  'switch': 'Switch',
  'datepicker': 'DatePicker',
  'button': 'Button'
}


module.exports = function(schema, option) {
  const { _, prettier } = option;
  const width = option.responsive.width || 750;
  const rpx = width == 375 ? 2 : 1;

  console.log({width}, {rpx}, option.responsive.width)

  // imports
  const imports = [];

  // inline style
  const style = {};

  // Global Public Functions
  const utils = [];

  // Classes
  const classes = [];

  // import taro组件名称列表
  const componentNames = {};

  // import taroify组件名称列表
  const taroifyComponentNames = {};

  // import image
  const imageSrc = [];

  let imageSrcIndex = 0;

  // 1vw = width / 100
  const _w = option.responsive.width / 100;

  const isExpression = (value) => {
    return /^\{\{.*\}\}$/.test(value);
  };

  const toString = (value) => {
    if ({}.toString.call(value) === '[object Function]') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      });
    }

    return String(value);
  };

  // 递归生成scss
  const generateScss = (schema) => {
    let strScss = '';

    function walk(json) {
      if (json.props.className) {
        let className = json.props.className;

        strScss += `.${className} {`;

        for (let key in style[className]) {
          // console.log('style[className]==', style[className])
          strScss += `${_.kebabCase(key)}: ${style[className][key]};\n`;
        }
      }

      if (json.children && Array.isArray(json.children)) {
        json.children.forEach((child) => walk(child));
      }

      if (json.props.className) {
        strScss += '}';
      }
    }

    walk(schema);

    return strScss;
  };

  // convert to responsive unit, such as vw
  const parseStyle = (styles) => {
    for (let style in styles) {
      // console.log(style, styles[style])
      // for (let key in styles[style]) {
        switch (style) {
          case 'fontSize':
          case 'marginTop':
          case 'marginBottom':
          case 'paddingTop':
          case 'paddingBottom':
          case 'height':
          case 'top':
          case 'bottom':
          case 'width':
          case 'maxWidth':
          case 'left':
          case 'right':
          case 'paddingRight':
          case 'paddingLeft':
          case 'marginLeft':
          case 'marginRight':
          case 'lineHeight':
          case 'borderBottomRightRadius':
          case 'borderBottomLeftRadius':
          case 'borderTopRightRadius':
          case 'borderTopLeftRadius':
          case 'borderRadius':
            // styles[style][key] = (parseInt(styles[style][key]) / _w).toFixed(2) + 'vw';
            // console.log(rpx)
            styles[style] = rpx == 1 ? parseInt(styles[style]) + 'px' : (parseInt(styles[style]) * 2) + 'px';
            break;
        }
      // }
    }

    return styles;
  };

  // parse function, return params and content
  const parseFunction = (func) => {
    const funcString = func.toString();
    const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
    const content = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    return {
      params,
      content,
    };
  };

  // parse layer props(static values or expression)
  const parseProps = (value, isReactNode) => {
    if (typeof value === 'string') {
      if (isExpression(value)) {
        if (isReactNode) {
          return value.slice(1, -1);
        } else {
          return value.slice(2, -2);
        }
      }

      if (isReactNode) {
        return value;
      } else {
        return `'${value}'`;
      }
    } else if (typeof value === 'function') {
      const { params, content } = parseFunction(value);
      return `(${params}) => {${content}}`;
    }
    return value
  };

  // parse async dataSource
  const parseDataSource = (data) => {
    const name = data.id;
    const { uri, method, params } = data.options;
    const action = data.type;
    let payload = {};

    switch (action) {
      case 'fetch':
        if (imports.indexOf(`import {fetch} from whatwg-fetch`) === -1) {
          imports.push(`import {fetch} from 'whatwg-fetch'`);
        }
        payload = {
          method: method,
        };

        break;
      case 'jsonp':
        if (imports.indexOf(`import {fetchJsonp} from fetch-jsonp`) === -1) {
          imports.push(`import jsonp from 'fetch-jsonp'`);
        }
        break;
    }

    Object.keys(data.options).forEach((key) => {
      if (['uri', 'method', 'params'].indexOf(key) === -1) {
        payload[key] = toString(data.options[key]);
      }
    });

    // params parse should in string template
    if (params) {
      payload = `${toString(payload).slice(0, -1)} ,body: ${isExpression(params) ? parseProps(params) : toString(params)}}`;
    } else {
      payload = toString(payload);
    }

    let result = `{
      ${action}(${parseProps(uri)}, ${toString(payload)})
        .then((response) => response.json())
    `;

    if (data.dataHandler) {
      const { params, content } = parseFunction(data.dataHandler);
      result += `.then((${params}) => {${content}})
        .catch((e) => {
          console.log('error', e);
        })
      `;
    }

    result += '}';

    return `${name}() ${result}`;
  };

  // parse condition: whether render the layer
  const parseCondition = (condition, render) => {
    if (typeof condition === 'boolean') {
      return `${condition} && ${render}`;
    } else if (typeof condition === 'string') {
      return `${condition.slice(2, -2)} && ${render}`;
    }
  };

  // parse loop render
  const parseLoop = (loop, loopArg, render) => {
    let data;
    let loopArgItem = (loopArg && loopArg[0]) || 'item';
    let loopArgIndex = (loopArg && loopArg[1]) || 'index';

    if (Array.isArray(loop)) {
      data = toString(loop);
    } else if (isExpression(loop)) {
      data = loop.slice(2, -2);
    }

    // add loop key
    const tagEnd = render.match(/^<.+?\s/)[0].length;
    render = `${render.slice(0, tagEnd)} key={${loopArgIndex}}${render.slice(tagEnd)}`;

    // remove `this`
    const re = new RegExp(`this.${loopArgItem}`, 'g');
    render = render.replace(re, loopArgItem);

    return `${data}.map((${loopArgItem}, ${loopArgIndex}) => {
      return (${render});
    })`;
  };

  // generate render xml
  const generateRender = (schema) => {
    const type = schema.componentName.toLowerCase();
    const className = schema.props && schema.props.className;
    const classString = className ? ` className={styles.${className}}` : '';
    console.log('classString==', classString, className)
    if (className) {
      style[className] = parseStyle(schema.props.style);
    }

    // taro组件
    if (nameMapping[type]) {
      componentNames[nameMapping[type]] = true;
    }

    // taroify组件
    if (taroifyMapping[type]) {
      taroifyComponentNames[taroifyMapping[type]] = true;
    }

    let xml;
    let props = '';

    Object.keys(schema.props).forEach((key) => {
      if (['className', 'style', 'text', 'src', 'lines', 'dealGradient'].indexOf(key) === -1) {
        props += ` ${key}={${parseProps(schema.props[key])}}`;
      }
    });
    // console.log('type==', type)

    switch (type) {
      case 'text':
        const innerText = parseProps(schema.props.text, true);
        xml = `<Text${classString}${props}>${innerText}</Text>`;
        break;
      case 'image':
        const source = parseProps(schema.props.src);
        console.log('classNameiamge', className, schema.props, source)
        imageSrc.push(`import url${imageSrcIndex} from ${source}`)
        xml = `<Image${classString}${props} src={url${imageSrcIndex} } />`;
        imageSrcIndex++
        break;
      case 'input':
      case 'upload':
      case 'switch':
      // case 'radiogroup':
      // case 'datepicker':
        xml = `<${taroifyMapping[type]}${classString}${props} />`;
        break;
      case 'button':
        if (schema.children && typeof schema.children === 'string') {
          xml = `<${taroifyMapping[type]}${classString}${props}>${schema.children}</${taroifyMapping[type]}>`;
        } else {
          xml = `<${taroifyMapping[type]}${classString}${props} />`;
        }
        break;
      case 'div':
      case 'page':
      case 'block':
        if (schema.children && schema.children.length) {
          xml = `<View${classString}${props}>${transform(schema.children)}</View>`;
        } else {
          xml = `<View${classString}${props} />`;
        }
        break;
    }

    if (schema.loop) {
      xml = parseLoop(schema.loop, schema.loopArgs, xml);
    }
    if (schema.condition) {
      xml = parseCondition(schema.condition, xml);
    }
    if (schema.loop || schema.condition) {
      xml = `{${xml}}`;
    }

    return xml;
  };

  const myComponentName = schema.myComponentName || `${schema.componentName}${new Date().getTime()}`;

  // parse schema
  const transform = (schema) => {
    let result = '';
    // 数组处理
    if (Array.isArray(schema)) {
      schema.forEach((layer) => {
        result += transform(layer);
      });
    } else {
      const type = schema.componentName.toLowerCase();

      if (['page'].indexOf(type) !== -1) {
        // 容器组件处理: state/method/dataSource/lifeCycle/render
        const states = [];
        const lifeCycles = [];
        const methods = [];
        const init = [];
        const render = [`render(){ return (`];
        let classData = [`export default class ${myComponentName} extends Component {`];
        // classData.push('@Inject(IndexService) indexService: IndexService;\n');
        if (schema.state) {
          states.push(`state = ${toString(schema.state)}\n`);
        }

        if (schema.methods) {
          Object.keys(schema.methods).forEach((name) => {
            const { params, content } = parseFunction(schema.methods[name]);
            methods.push(`${name}(${params}) {${content}}\n`);
          });
        }

        if (schema.lifeCycles) {
          if (!schema.lifeCycles['_constructor']) {
            lifeCycles.push(`constructor(props, context) { super(); ${init.join('\n')}}\n`);
          }

          Object.keys(schema.lifeCycles).forEach((name) => {
            const { params, content } = parseFunction(schema.lifeCycles[name]);

            if (name === '_constructor') {
              lifeCycles.push(`constructor(${params}) { super(); ${content} ${init.join('\n')}}\n`);
            } else {
              lifeCycles.push(`${name}(${params}) {${content}}\n`);
            }
          });
        }

        render.push(generateRender(schema));
        render.push(`);}`);

        classData = classData
          .concat(states)
          .concat(lifeCycles)
          .concat(methods)
          .concat(render);
        classData.push('}');

        classes.push(classData.join('\n'));
      } else {
        result += generateRender(schema);
      }
    }

    return result;
  };

  // start parse schema
  transform(schema);

  const prettierOpt = {
    parser: 'babel',
    printWidth: 200,
    singleQuote: true,
    tabWidth: 2,
    semi: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    endOfLine: "lf"
  };

  return {
    // ${imageSrc.map((s, i) => `import url${i} from ${s};`)}
    // 最终生成转换文件
    panelDisplay: [
      {
        panelName: `index.tsx`,
        panelValue: prettier.format(
          `
          import Taro from '@tarojs/taro'
          import React, { Component } from 'react';
          import { ${Object.keys(componentNames).join(', ')} } from '@tarojs/components';
          import { ${Object.keys(taroifyComponentNames).join(', ')} } from '@taroify/core';
          ${imports.join('\n')}
          import styles from './index.module.scss';\n
          ${imageSrc.join('\n')}
          ${utils.join('\n')}\n
          ${classes.join('\n')}
        `,
          prettierOpt
        ),
        panelType: 'ts',
      },
      {
        panelName: `index.module.scss`,
        panelValue: prettier.format(generateScss(schema), {
          parser: 'scss',
        }),
        panelType: 'scss',
      },
      {
        panelName: `index.config.ts`,
        panelValue: prettier.format(
          `export default {
          navigationBarTitleText: '',
        }`,
          prettierOpt
        ),
        panelType: 'ts',
      },
    ],
    noTemplate: true,
  };
};
