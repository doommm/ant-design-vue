import { mount } from '@vue/test-utils';
import { asyncExpect } from '../../../tests/utils';
import Popover from '..';
import mountTest from '../../../tests/shared/mountTest';

describe('Popover', () => {
  mountTest({
    render() {
      return (
        <div>
          <Popover />
        </div>
      );
    },
  });
  it('should show overlay when trigger is clicked', async () => {
    const popover = mount(
      {
        render() {
          return (
            <Popover
              ref="popover"
              content="console.log('hello world')"
              title="code"
              trigger="click"
            >
              <span>show me your code</span>
            </Popover>
          );
        },
      },
      { sync: false },
    );
    await asyncExpect(() => {
      expect(popover.vm.$refs.popover.getPopupDomNode()).toBe(null);

      popover.find('span').trigger('click');
    }, 0);
    let popup = null;
    await asyncExpect(() => {
      popup = popover.vm.$refs.popover.getPopupDomNode();
      expect(popup).not.toBe(null);
    }, 1000);
    await asyncExpect(() => {
      expect(popup.innerHTML).toMatchSnapshot();
      expect(popup.innerHTML).toMatchSnapshot();
    });
  });
});

describe('Popover in shadow dom', () => {
  function initShadowDom() {
    document.body.innerHTML = '';

    const divApp = document.createElement('div');
    divApp.id = 'app';
    document.body.appendChild(divApp);
    const shadowRoot = divApp.attachShadow({ mode: 'open' });
    // window.__mount_root__ = shadowRoot;

    const div2 = document.createElement('div');
    div2.id = 'div2';
    shadowRoot.appendChild(div2);
  }

  function getAppShadowRoot() {
    const div = document.querySelector('#app');
    return div.shadowRoot;
  }

  beforeEach(() => {
    initShadowDom();
  });

  it('should hide overlay when trigger is clicked outside the shadow dom', async () => {
    const shadowRoot = getAppShadowRoot();

    const popover = mount(
      {
        render() {
          return (
            <Popover
              ref="popover"
              content="console.log('hello world')"
              title="code"
              trigger="click"
              destroyTooltipOnHide={true}
            >
              <span>show me your code</span>
            </Popover>
          );
        },
      },
      { sync: false, attachTo: shadowRoot },
    );

    await asyncExpect(() => {
      expect(popover.vm.$refs.popover.getPopupDomNode()).toBe(null);

      popover.find('span').trigger('click');
    }, 0);
    let popup = null;
    await asyncExpect(() => {
      popup = popover.vm.$refs.popover.getPopupDomNode();
      expect(popup).not.toBe(null);
    }, 1000);
    await asyncExpect(() => {
      expect(popup.innerHTML).toMatchSnapshot();
      expect(popup.innerHTML).toMatchSnapshot();
    });

    await asyncExpect(() => {
      const div = shadowRoot.getElementById('div2');
      div.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    });

    await asyncExpect(() => {
      const popupNode = popover.vm.$refs.popover.getPopupDomNode();
      expect(popupNode).toBeInstanceOf(Comment);
      expect(popupNode.data).toEqual('');
    }, 500);
  });
});
