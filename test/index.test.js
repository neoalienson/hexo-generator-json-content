'use strict';

const should = require('chai').should();
const Hexo = require('hexo');
const path = require('path');

describe('JSON Content generator', () => {
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
        meta: true,
        pages: true,
        posts: true
      }
    };
    global.hexo = hexo;
    delete require.cache[require.resolve('../dist/main.js')];
  });

  it('generates JSON with meta information', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    result.should.be.an('object');
    result.should.have.property('path');
    result.should.have.property('data');
    result.path.should.equal('content.json');
    
    const data = JSON.parse(result.data);
    data.should.have.property('meta');
    data.meta.title.should.equal('Test Blog');
  });

  it('uses custom file path', async () => {
    hexo.config.jsonContent.file = 'custom.json';
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    result.path.should.equal('custom.json');
  });

  it('generates pages content', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.should.have.property('pages');
    data.pages.should.be.an('array');
  });

  it('generates posts content', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.should.have.property('posts');
    data.posts.should.be.an('array');
  });

  it('ignores password protected content', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const mockPage = {
      title: 'Secret Page',
      password: 'secret123',
      path: 'secret/',
      published: true
    };
    
    const site = {
      pages: [mockPage],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.pages.should.be.an('array');
    data.pages.length.should.equal(0);
  });

  it('ignores hidden content', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const mockPage = {
      title: 'Hidden Page',
      hidden: true,
      path: 'hidden/',
      published: true
    };
    
    const site = {
      pages: [mockPage],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.pages.should.be.an('array');
    data.pages.length.should.equal(0);
  });

  it('works without meta', async () => {
    hexo.config.jsonContent.meta = false;
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const site = {
      pages: [],
      posts: { sort: () => [] }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.should.not.have.property('meta');
  });

  it('filters unpublished posts by default', async () => {
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const mockPost = {
      title: 'Draft Post',
      published: false,
      path: 'draft/',
      categories: { map: (fn) => [] },
      tags: { map: (fn) => [] }
    };
    
    const site = {
      pages: [],
      posts: {
        sort: () => [mockPost],
        filter: function(fn) { return this.sort().filter(fn); }
      }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.posts.should.be.an('array');
    data.posts.length.should.equal(0);
  });

  it('includes drafts when configured', async () => {
    hexo.config.jsonContent.drafts = true;
    require('../dist/main.js');
    const generator = hexo.extend.generator.get('json-content');
    
    const mockPost = {
      title: 'Draft Post',
      slug: 'draft-post',
      date: new Date(2024, 0, 1),
      updated: new Date(2024, 0, 2),
      path: 'draft/',
      permalink: 'https://test.com/draft/',
      excerpt: '<p>Draft</p>',
      content: '<p>Draft content</p>',
      published: false,
      categories: { map: (fn) => [] },
      tags: { map: (fn) => [] }
    };
    
    const site = {
      pages: [],
      posts: {
        sort: () => [mockPost],
        filter: function(fn) { return this.sort().filter(fn); }
      }
    };
    
    const result = await Promise.resolve(generator(site));
    const data = JSON.parse(result.data);
    data.posts.should.be.an('array');
    data.posts.length.should.equal(1);
  });
});
