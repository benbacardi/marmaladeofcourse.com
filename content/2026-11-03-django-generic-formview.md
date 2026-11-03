title: Django’s Generic Views: FormView
category: Development
tags: Python, Django
image: /assets/django-cbv-form.png

Fourth in my series looking at Django's generic class-based views and the customisation available in each class is the humble `FormView`, a simple class that provides a standard pattern for rendering a form, accepting and validating input, surfacing errors, and redirecting on success.

As a reminder, the site [Classy Class-Based Views](https://ccbv.co.uk/) is an invaluable resource for understanding Django's class-based views.

> #### Posts in this series
>
> * [`ListView`]({filename}2026-10-01-django-generic-listview.md)
> * [`DetailView`]({filename}2026-10-02-django-generic-detailview.md)
> * [`TemplateView`]({filename}2026-11-02-django-generic-templateview.md)
> * [`FormView`]({filename}2026-11-03-django-generic-formview.md) (this post)

---

Unlike two of the previous CBVs, the `FormView` doesn't operate on a model. Instead, we're going to start with a simple form:

```python
class PostForm(forms.Form):
    title = form.CharField(max_length=255)
    is_featured = form.BooleanField(default=False)
    post = form.TextField()
```

We'll cover the following attributes, if you want to jump straight to each section:

* [`form_valid`](#form-valid)
* [`get_success_url`](#get-success-url)
* [`form_invalid`](#form-invalid)
* [`initial`](#initial)
* [`get_initial`](#get-initial)
* [`get_form_kwargs`](#get-form-kwargs)

## The Simple `FormView`

At its most basic, Django's `FormView` will render a template with a particular form. In our case, that's the `PostForm`, and it's specified with the `form_class` attribute:

```python
from django.views.generic import FormView
from django.urls import reverse_lazy
from .forms import PostForm

class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
```

Besides the form class, a `success_url` needs to be specified. This can be a raw string URL (such as `"/success/"`), or a lazily-reversed URL pattern as above.

Additionally, a `template_name` must be specified too. The `FormView` does not provide a default like the model-based `ListView` and `DetailView` do.

This template will be handed a single context variable named `form`, which is the bound (for `POST` requests) or unbound (for `GET` requests) form instance.

> **Reminder**: an *unbound* form is one which has not yet been filled in. A *bound* form is one that has been populated with data, and possibly validated.

On a `GET` request, the form is passed no data, and the template should render the empty form. On a `POST` request:

- the form is passed the `POST` data to create the *bound* form instance
- the form instance is validated
- on a valid form, the user is redirected to `success_url`
- on an invalid form, the template is rendered with the bound form instance, to display the errors arising from the validation

### What's the point in redirecting immediately? I need to do something with the submitted data! {#form-valid}

That's what `form_valid` is for:

```python hl_lines="6 7 8"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    
    def form_valid(self, form):
        # Do something with the data in form.cleaned_data
        return super().form_valid(form)
```

The method is passed the `form` instance. Don't forget to return, usually calling `super()`, otherwise no HTTP response will be sent!

### I need to redirect somewhere different on success, sometimes. {#get-success-url}

Luckily, `success_url` doesn't need to be a static class variable! Override `get_success_url`:

```python hl_lines="5 6 7 8"
class PostView(FormView):
	form_class = PostForm
    template_name = "post_form.html"
    
    def get_success_url(self):
        if self.request.user.is_authenticated:
            return reverse("user-success")
		return reverse("guest-success")
```

You don't need both `success_url` and `get_success_url`.

### I want to do something when bad data is submitted too. {#form-invalid}

Just like `form_valid`, there's also `form_invalid`:

```python hl_lines="6 7 8"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    
    def form_invalid(self, form):
        logger.warn("Invalid data submitted!")
        return super().form_invalid(form)
```

Also like `form_valid`, **don't forget** to call the `super()` version of the method (passing the `form` instance) too.

### I want to populate my form with data on first load. {#initial}

Well, as well as from specifying `default`s on the form fields themselves, you can always use `initial`:

```python hl_lines="5 6 7"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    initial = {
        "title": "My Post Title",
    }
```

### But my initial data isn't static! {#get-initial}

Then override `get_initial` instead:

```python hl_lines="6 7 8"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    
    def get_initial(self):
        return {
            "title": f"{self.request.user}'s Post Title",
        }
```

### My form needs some data from the view before it can render. {#get-form-kwargs}

That's what `get_form_kwargs` is for!

```python hl_lines="6 7 8"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs(self)
        kwargs["user"] = self.request.user
        return kwargs
```

Make sure you call `super()` first, then add to the dictionary of keyword arguments it returns.

### My template needs additional context variables. {#extra-context}

`FormView` subclasses the same mechanism that powers `TemplateView`, so check out my [previous post]({filename}2026-11-02-django-generic-templateview.md) to discover how to specify a different template name or add additional variables into the context.

If using `get_context_data`, however, don't forget to call `super()` and *add* to the returned context, though, otherwise your template will lose its `form` variable:

```python hl_lines="6 7 8 9"
class PostView(FormView):
	form_class = PostForm
    success_url = reverse_lazy("success")
    template_name = "post_form.html"
    
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["post_count"] = Post.objects.count()
        return context
```

