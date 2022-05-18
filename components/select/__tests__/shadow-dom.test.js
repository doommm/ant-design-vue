import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { asyncExpect } from '../../../tests/utils';
import Select from '..';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import focusTest from '../../../tests/shared/focusTest';
import mountTest from '../../../tests/shared/mountTest';

function $$(className) {
  return document.body.querySelectorAll(className);
}

function $$shadow(className) {
  const shadow = getShadowRoot();
  return shadow.querySelectorAll(className);
}

function getStyle(el, prop) {
  const style = window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;

  // If a css property's value is `auto`, it will return an empty string.
  return prop ? style[prop] : style;
}

function initShadowDom() {
  document.body.innerHTML = '';

  const divApp = document.createElement('div');
  divApp.id = 'app';
  document.body.appendChild(divApp);
  const shadowRoot = divApp.attachShadow({ mode: 'open' });
  window.__mount_root__ = shadowRoot;

  const div2 = document.createElement('div');
  div2.id = 'other';
  document.body.appendChild(div2);
}

function getShadowRoot() {
  const div = document.querySelector('#app');
  return div.shadowRoot;
}

describe('Select in shadow dom', () => {
  beforeEach(() => {
    initShadowDom();
  });
  focusTest(Select);
  mountTest({
    render() {
      return (
        <div>
          <Select />
        </div>
      );
    },
  });

  it('should have default notFoundContent', async () => {
    const wrapper = mount(
      {
        render() {
          return <Select mode="multiple" />;
        },
      },
      {
        sync: false,
        attachTo: getShadowRoot(),
      },
    );
    await asyncExpect(() => {
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
    });

    await asyncExpect(() => {
      expect($$('.ant-select-item-option').length).toBe(0);
      expect($$('.ant-empty-description')[0].innerHTML).toBe('No Data');
    }, 100);
  });

  it('should support set notFoundContent to null', async () => {
    const wrapper = mount(
      {
        render() {
          return <Select mode="multiple" notFoundContent={null} />;
        },
      },
      {
        sync: false,
        attachTo: getShadowRoot(),
      },
    );
    await asyncExpect(() => {
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
    });

    await asyncExpect(() => {
      expect($$('.ant-select-item-option').length).toBe(0);
    });
  });

  it('should not have default notFoundContent when mode is combobox', async () => {
    const wrapper = mount(
      {
        render() {
          return <Select mode={Select.SECRET_COMBOBOX_MODE_DO_NOT_USE} />;
        },
      },
      {
        sync: false,
        attachTo: getShadowRoot(),
      },
    );
    await asyncExpect(() => {
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
    });

    await asyncExpect(() => {
      expect($$('.ant-select-item-option').length).toBe(0);
    });
  });

  it('should not have notFoundContent when mode is combobox and notFoundContent is set', async () => {
    const wrapper = mount(
      {
        render() {
          return (
            <Select mode={Select.SECRET_COMBOBOX_MODE_DO_NOT_USE} notFoundContent="not at all" />
          );
        },
      },
      {
        sync: false,
        attachTo: getShadowRoot(),
      },
    );
    await asyncExpect(() => {
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
    });

    await asyncExpect(() => {
      expect($$('.ant-select-item-option').length).toBe(0);
      expect($$('.ant-select-item-empty').length).toBe(1);
      // expect($$('.ant-select-item-option')[0].innerHTML).toMatchSnapshot();
    }, 100);
  });

  it('should be controlled by open prop', async () => {
    const onDropdownVisibleChange = jest.fn();
    const wrapper = mount(
      {
        props: {
          open: {
            type: Boolean,
            default: true,
          },
        },
        render() {
          return (
            <Select open={this.open} onDropdownVisibleChange={onDropdownVisibleChange}>
              <Select.Option value="1">1</Select.Option>
            </Select>
          );
        },
      },
      { sync: false, attachTo: getShadowRoot() },
    );

    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('block');
    }, 100);
    await asyncExpect(() => {
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
    });
    await asyncExpect(() => {
      expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(false);
    });
    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('block');
      wrapper.setProps({ open: false });
    });

    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('none');
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
      expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(true);
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('none');
    }, 500);
  });

  // shadow dom document click
  it('click outside shadow dom should affect select component', async () => {
    const onDropdownVisibleChange = jest.fn();
    const onUpdateOpen = jest.fn();

    const wrapper = mount(
      {
        props: {
          open: {
            type: Boolean,
            default: true,
          },
        },
        render() {
          return h(
            <Select open={this.open} onDropdownVisibleChange={onDropdownVisibleChange}>
              <Select.Option value="1">1</Select.Option>
            </Select>,
          );
        },
      },
      { sync: false, attachTo: getShadowRoot() },
    );

    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('block');
    }, 100);

    await asyncExpect(() => {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    });

    await asyncExpect(() => {
      expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(false);
    });

    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('block');
      wrapper.setProps({ open: false });
    });

    await asyncExpect(() => {
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('none');
      wrapper.findAll('.ant-select-selector')[0].element.dispatchEvent(new MouseEvent('mousedown'));
      expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(true);
      expect(getStyle($$('.ant-select-dropdown')[0], 'display')).toBe('none');
    }, 500);
  });

  describe('Select Custom Icons', () => {
    it('should support customized icons', () => {
      const wrapper = mount(
        {
          render() {
            return (
              <Select
                removeIcon={<CloseOutlined />}
                clearIcon={<CloseOutlined />}
                menuItemSelectedIcon={<CloseOutlined />}
              >
                <Select.Option value="1">1</Select.Option>
              </Select>
            );
          },
        },
        {
          attachTo: getShadowRoot(),
        },
      );
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
