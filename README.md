# hexo-renderer-sass2

A hexo plugin for sass, hexo could compile sass/scss files automatically

## Install

```bash
npm install hexo-renderer-sass2
```

## Usage

Create `_config.yml` file in your custom theme directory

Add content

```yml
sass:
  compressed: true #compress css
  save: false # save css

  theme: light # custom theme name

  light:
    background: '#fff'
    primaryColor: '#2F66FF'
    gradualColor: '#494FF0'
    secondaryColor: '#E7EDFF'

    contrast: '#EA7079'
    contrastSecondary: '#FFEEEF'

    footer: $primaryColor  # Cite previous variable
```

```scss
// You can use theme("name") to get custom theme value from _config.yml

body{
    background: theme("background");
}

div{
    background: theme("footer")
}

```