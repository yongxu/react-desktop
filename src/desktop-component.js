import React, { PropTypes } from 'react';
import Radium from 'radium';
import { convertColor } from './color';
import WindowFocusComponent from 'desktop-component/window-focus';
import PlaceholderStyleComponent from 'desktop-component/placeholder-style';
import CommonStylingComponent from 'desktop-component/common-styling';

export const WindowFocus = 'WindowFocus';
export const PlaceholderStyle = 'PlaceholderStyle';
export const Dimension = function (defaultWidth, defaultHeight) {
  return ['Dimension', { defaultWidth: defaultWidth, defaultHeight: defaultHeight }];
};
export const Margin = 'Margin';
export const Padding = 'Padding';
export const HorizontalAlignment = 'HorizontalAlignment';
export const VerticalAlignment = 'VerticalAlignment';
export const Alignment = 'Alignment';
export const Hidden = 'Hidden';
export const Background = 'Background';

function ExtendComposedComponent(options, ComposedComponent) {
  @Radium
  class Component extends ComposedComponent {
    static propTypes = {
      children: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.array]),
      style: PropTypes.object,
      visible: PropTypes.bool,
      display: PropTypes.bool,
      color: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      theme: PropTypes.string,
      ...ComposedComponent.propTypes
    };

    static childContextTypes = {
      parent: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
      color: PropTypes.string,
      background: PropTypes.string,
      theme: PropTypes.string,
      storage: PropTypes.object,
      ...ComposedComponent.childContextTypes
    };

    static contextTypes = {
      parent: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
      color: PropTypes.string,
      background: PropTypes.string,
      theme: PropTypes.string,
      storage: PropTypes.object,
      ...ComposedComponent.contextTypes
    };

    _components = [];
    _params = {};

    constructor(props, context, updater) {
      const { visible, display, theme, storage, color, background, ...properties } = props;
      super(props, context, updater);

      this.context = this.context || {};
      this.state = this.state || {};

      this.state.visible = this.state.visible || visible !== false;
      this.state.display = this.state.display || display !== false;

      if (!context.storage) {
        this.context.storage = storage ? storage : null;
      }
      this.storage = storage ? storage : this.context.storage;

      if (!context.theme) {
        this.context.theme = theme ? theme : 'light';
      }
      this.state.theme = theme ? theme : this.context.theme;

      if (!context.color) {
        this.context.color = color && typeof color !== 'boolean' ? convertColor(color) : convertColor('blue');
      }
      this.state.color = color && typeof color !== 'boolean' ? convertColor(color) : this.context.color;

      if (!context.background) {
        this.context.background = background ? convertColor(background) : null;
      }
      this.state.background = background ? convertColor(background) : this.context.background;

      this.initOptions();
      this.init();
    }

    initOptions() {
      options.forEach((item, key) => {
        if (typeof item === 'object' && Object.prototype.toString.call(item) === '[object Array]') {
          options[key] = item[0];
          this._params[item[0]] = item[1];
        } else if (typeof item === 'function') {
          const option = item();
          options[key] = option[0];
          this._params[option[0]] = option[1];
        }
      });
    }

    init() {
      if (options.indexOf('WindowFocus') !== -1) {
        this._components = [...this._components, new WindowFocusComponent(this)];
      }
      if (options.indexOf('PlaceholderStyle') !== -1) {
        this._components = [...this._components, new PlaceholderStyleComponent(this)];
      }
      if (
        options.indexOf('Dimension') !== -1 ||
        options.indexOf('Margin') !== -1 ||
        options.indexOf('Padding') !== -1 ||
        options.indexOf('HorizontalAlignment') !== -1 ||
        options.indexOf('VerticalAlignment') !== -1 ||
        options.indexOf('Alignment') !== -1 ||
        options.indexOf('Hidden') !== -1 ||
        options.indexOf('Background') !== -1
      ) {
        let componentOptions = {
          dimension: options.indexOf('Dimension') !== -1,
          margin: options.indexOf('Margin') !== -1,
          padding: options.indexOf('Padding') !== -1,
          horizontalAlignment: options.indexOf('HorizontalAlignment') !== -1,
          verticalAlignment: options.indexOf('VerticalAlignment') !== -1,
          alignment: options.indexOf('Alignment') !== -1,
          hidden: options.indexOf('Hidden') !== -1,
          background: options.indexOf('Background') !== -1
        };
        Component.propTypes = { ...Component.propTypes, ...CommonStylingComponent.propTypes(componentOptions) };
        this._components = [
          ...this._components,
          new CommonStylingComponent(this, componentOptions, this._params, ComposedComponent.styleRefs)
        ];
      }
    }

    getChildContext() {
      const childContext = {
        parent: this,
        color: this.state.color,
        background: typeof this.state.background === 'boolean' ? this.state.color : this.state.background,
        theme: this.state.theme,
        storage: this.storage
      };

      if (super.getChildContext) {
        return {
          ...childContext,
          ...super.getChildContext()
        };
      }

      return childContext;
    }

    componentDidMount() {
      if (super.componentDidMount) {
        super.componentDidMount();
      }

      for (const component of this._components) {
        if (component.componentDidMount) {
          component.componentDidMount();
        }
      }
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
      if (super.componentDidUpdate) {
        super.componentDidUpdate(prevProps, prevState, prevContext);
      }

      for (const component of this._components) {
        if (component.componentDidUpdate) {
          component.componentDidUpdate();
        }
      }
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      for (const component of this._components) {
        if (component.componentWillUnmount) {
          component.componentWillUnmount();
        }
      }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
      if (super.shouldComponentUpdate) {
        return super.shouldComponentUpdate(nextProps, nextState, nextContext);
      }

      for (let prop in nextContext) {
        if (nextContext.hasOwnProperty(prop)) {
          if (typeof this.context[prop] === 'undefined' || nextContext[prop] !== this.context[prop]) {
            return true;
          }
        }
      }

      for (let prop in nextProps) {
        if (nextProps.hasOwnProperty(prop)) {
          if (typeof this.props[prop] === 'undefined' || nextProps[prop] !== this.props[prop]) {
            return true;
          }
        }
      }

      for (let prop in nextState) {
        if (nextState.hasOwnProperty(prop)) {
          if (typeof this.state[prop] === 'undefined' || nextState[prop] !== this.state[prop]) {
            return true;
          }
        }
      }

      return false;
    }

    componentWillReceiveProps(nextProps, nextContext) {
      if (super.componentWillReceiveProps) {
        return super.componentWillReceiveProps(nextProps, nextContext);
      }

      const stateProps = ['visible', 'display', 'theme', 'color', 'background'];
      const stateContext = ['theme', 'color', 'background'];

      let changeState = false;
      let state = {};
      for (let prop in nextProps) {
        if (nextProps.hasOwnProperty(prop) && stateProps.indexOf(prop) !== -1) {
          let value = nextProps[prop];
          if (prop === 'color' && typeof value === 'boolean') {
            continue;
          }
          if (nextProps[prop] !== undefined && value !== this.state[prop]) {
            state[prop] = value;
            changeState = true;
          }
        }
      }

      for (let prop in nextContext) {
        if (nextContext.hasOwnProperty(prop) && stateContext.indexOf(prop) !== -1) {
          if (nextContext[prop] !== undefined && nextContext[prop] !== this.state[prop]) {
            state[prop] = nextContext[prop];
            changeState = true;
          }
        }
      }

      if (changeState) {
        this.setState(state);
      }
    }

    render(...params) {
      let rendered = super.render(params);

      for (const component of this._components) {
        if (component.render) {
          rendered = component.render(rendered);
        }
      }

      if (super.getPlaceholderStyle) {
        rendered = <div ref="container">{rendered}</div>;
      }

      return rendered;
    }
  }

  return Component;
}

export default function DesktopComponent(...options) {
  if (options.length === 1 && typeof options[0] === 'function') {
    return ExtendComposedComponent.apply(null, [[], options[0]]);
  }

  return ExtendComposedComponent.bind(null, options);
}
