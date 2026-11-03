title: Django’s Generic Views: TemplateView
category: Development
tags: Python, Django
image: /assets/django-cbv-template.png

Next in my series on Django's generic class-based views is the simple `TemplateView`, a view whose responsibility lies solely in rendering a template.

As a reminder, the site [Classy Class-Based Views](https://ccbv.co.uk/) is an invaluable resource for understanding Django's class-based views.

> #### Posts in this series
>
> * [`ListView`]({filename}2026-10-01-django-generic-listview.md)
> * [`DetailView`]({filename}2026-10-02-django-generic-detailview.md)
> * [`TemplateView`]({filename}2026-11-02-django-generic-templateview.md) (this post)
> * [`FormView`]({filename}2026-11-03-django-generic-formview.md)

---

There's no additional code required for a `TemplateView`—just a template. We'll cover the following attributes, if you want to jump straight to each section:

* [`extra_context`](#extra-context)
* [`get_context_data`](#get-context-data)
* [`template_engine`](#template-engine)

## The Simple `TemplateView`

A very simple view, the `TemplateView` has just one required property:

```python
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = "home.html"
```

The template specified by `template_name` is rendered by the default template renderer specified in the project's settings.

### My template needs additional context variables. {#extra-context}

You can use `extra_context` for that:

```python hl_lines="3"
class HomeView(TemplateView):
    template_name = "home.html"
    extra_context = {"section": "blog"}
```

### But the extra data isn't static, though. {#get-context-data}

For anything more complex, you can override `get_context_data`:

```python hl_lines="5 6 7 8 9"
class HomeView(TemplateView):
    template_name = "home.html"
    extra_context = {"section": "blog"}

    def get_context_data(self, *args, **kwargs):
        context = {
            "post_count": Post.objects.count(),
        }
        return context
```

### For this one template, I want to use Jinja2 instead of Django's template language. {#template-engine}

Sure! Specify that with `template_engine`:

```python hl_lines="3"
class HomeView(TemplateView):
    template_name = "home.html"
    template_engine = "jinja2"
```

