'use strict';

const should = require('chai').should();
const Hexo = require('hexo');
const path = require('path');

describe('JSON Content generator - disable', () => {
  let hexo;
  
  beforeEach(() => {
    hexo = new Hexo(path.join(__dirname, '..'), {silent: true});
    hexo.config = {
      title: 'Test Blog',
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      author: 'Test Author',
      url: 'https://test.com',
      root: '/',
      jsonContent: {
        enable: false
      }
    };
    global.hexo = hexo;
    delete require.cache[require.resolve('../dist/main.js')];
  });

  it('does not generate when disabled', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    should.not.exist(result);
  });
});
