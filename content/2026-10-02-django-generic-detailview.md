title: Django’s Generic Views: DetailView
category: Development
tags: Python, Django

Continuing from my previous post on Django's [generic `ListView`]({filename}2026-10-01-django-generic-listview.md), this article will instead cover the available customisation of the `DetailView`. Some options (like ordering and pagination) aren't available for this view, but there are a few others that are different.

As a reminder, the site [Classy Class-Based Views](https://ccbv.co.uk/) is an invaluable resource for understanding Django's class-based views.

> #### Posts in this series
>
> * [`ListView`]({filename}2026-10-01-django-generic-listview.md)
> * [`DetailView`]({filename}2026-10-02-django-generic-detailview.md) (this post)

---

Let's assume a single model:

```python
class Post(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True)
    is_featured = models.BooleanField(default=False)
    title_slug = models.SlugField()
```

We'll cover the following attributes, if you want to jump straight to each section:

* [`template_name`](#template-name)
* [`context_object_name`](#context-object-name)
* [`queryset`](#queryset)
* [`get_queryset()`](#get-queryset)
* [`pk_url_kwarg`](#pk-url-kwarg)
* [`slug_field`](#slug-field)
* [`slug_url_kwarg`](#slug-url-kwarg)
* [`extra_context`](#extra-context)
* [`get_context_data()`](#get-context-data)
* [`get_object`](#get-object)

## The Simple `DetailView`

At its most basic, Django's `DetailView` will render a template with the details of a particular instance from a specified model. In our case, a single Post object.

```python
from django.views.generic import DetailView

class PostDetail(DetailView):
    model = Post
```

A template named `post_detail.html` is expected, and it will be handed a variable named `object` which is a single `Post` instance. A template variable named `post` (derived from the model name) is also available, pointing to the same object. The object will be looked up in the `Post` model by the primary key fetched from the `pk` URL parameter.

Because the `DetailView` is designed to look up an object based on the URL, it has to be wired up to a URL pattern with a parameter, such as:

```python
path("/posts/<int:pk>/", PostDetail.as_view(), name="post-detail")
```

### But my template is called `single_post.html`! {#template-name}

Then update the template name that `DetailView` looks for:

```python hl_lines="3"
class PostDetail(DetailView):
    model = Post
    template_name = "single_post.html"
```

### In my template, I use `single_post` not `object`! {#context-object-name}

You can change the template variable name that `DetailView` sets:

```python hl_lines="4"
class PostDetail(DetailView):
    model = Post
    template_name = "single_post.html"
    context_object_name = "single_post"
```

Without this, the instance is available as either `object` or `post` (the second derived from the model name).

### Posts that aren't published shouldn't be visible! {#queryset}

Specify the base `QuerySet` that `DetailView` is using:

```python hl_lines="4"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    queryset = Post.objects.exclude(published_at__isnull=True)
```

Now even if you've got a URL with a valid primary key in it, the user will see a 404 if it's not published.

Notice that we don't need to specify the `model` anymore, but because we don't, the default variable of `post` is no longer available to the template.

### Future posts shouldn't be visible, either. {#get-queryset}

You can't do that with a class attribute (fetching the current time requires some runtime code, not compile-time code), but the `DetailView` still has you covered:

```python hl_lines="5 6 7"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

Future-dated posts will now return a 404.

### My URL parameter isn't called `pk`, it's `post_id` {#pk-url-kwarg}

Change which parameter the view is looking for:

```python hl_lines="4"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    pk_url_kwarg = "post_id"
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

### I want to use slugs in the URL, not primary keys.

That's actually supported out of the box, as long as your slug field is called `slug` and your URL parameter is also called `slug`:

```python
path("/posts/<slug:slug>/", PostDetail.as_view(), name="post-detail")
```

### My slug field is called `title_slug`. {#slug-field}

Oh, your URL pattern is like this, instead?

```python
path("/posts/<slug:title_slug>/", PostDetail.as_view(), name="post-detail")
```

Tell that to the view:

```python hl_lines="4"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    slug_field = "title_slug"
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

### The URL parameter for the slug is also called `title_slug`. {#slug-url-kwarg}

Don't worry, the view can handle that too:

```python hl_lines="5"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    slug_field = "title_slug"
    slug_url_kwarg = "title_slug"
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

### I need extra data in the template. {#extra-context}

Just like the most generic class-based views, the `DetailView` allow the passing of extra data to the template:

```python hl_lines="6"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    slug_field = "title_slug"
    slug_url_kwarg = "title_slug"
    extra_context = {"section": "blog"}
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

### My extra data isn't static, though. {#get-context-data}

Again, not limited to the `DetailView`, adding complex extra data to the template context is easy:

```python hl_lines="8 9 10 11 12 13"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    slug_field = "title_slug"
    slug_url_kwarg = "title_slug"
    extra_context = {"section": "blog"}
    
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["featured_posts"] = Post.objects.filter(
            is_featured=true
        ).order_by("-published_at")[:5]
        return context
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now)
```

### My objects don't come from models! {#get-object}

`DetailView` can handle that too! Throwing out everything I've said above about the `Post` model and querysets, you can override `get_object` and return whatever you need:

```python hl_lines="5 6 7 8 9 10"
class PostDetail(DetailView):
    template_name = "single_post.html"
    context_object_name = "single_post"
    
    def get_object(self, *args, **kwargs):
        slug = self.kwargs.get("title_slug")
        try:
            return fetch_post_from_api(slug=slug)
        except APIError:
            raise Http404("Post not found")
```



