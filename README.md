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
  prefix: prod_  # add custom filename prefix when saveing css

  theme: light # custom theme name

  light:
    background: '#fff'
    primaryColor: '#2F66FF'
    gradualColor: '#494FF0'
    secondaryColor: '#E7EDFF'

    contrast: '#EA7079'
    contrastSecondary: '#FFEEEF'

    footer: $primaryColor  # Cite previous variable
    width: 100px
```

You can use `theme("name")` to get custom theme value from `_config.yml`

```scss
body{
    background: theme("background"); //#fff
}

div{
    background: theme("footer") // #2F66FF
    width: theme("width") * 100 // 10000px
}
```

And in `:root`, you should use `#{}` to wrap `theme()`

```scss
:root{
    --primary-color: #{theme("primaryColor")} // #2F66FF
}
```

You can also use `hexo_config("name")` to get item from other options

```yml
# _config.yml
title: sass2
# development mode
dev: true
version: 0.1.0
```

```scss
div{
    @if hexo_config("dev") {
        background: #fff;
    } @else{
        background: #000;
    } // result is background: #fff;
}
```