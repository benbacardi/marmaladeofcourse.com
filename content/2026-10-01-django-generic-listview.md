title: Django’s Generic Views: ListView
category: Development
tags: Python, Django

Django's class-based views are very divisive; some people swear by them, others won't touch them with a barge pole and will stick entirely to function-based views. I'm not going to weigh in on that debate, but one thing I do think is that Django's documentation around their *generic* class-based views is not particularly great. There are no tutorials that show you how to use them, and only [reference pages that list some of their properties](https://docs.djangoproject.com/en/6.1/ref/class-based-views/generic-display/#listview) without any real guidance on what they do.

This post is going to focus on one of the most basic generic class-based views, and one that is reached for first by a lot of new-to-Django developers, the `ListView`. Starting from the simplest possible use, we'll walk through various options on how to customise its behaviour.

An excellent resource for diving deep into Django's class-based views is [Classy Class-Based Views](https://ccbv.co.uk/), which I highly recommend having a look through when you're ready to start piecing together how class-based views work under the hood.

> #### Posts in this series
>
> * [`ListView`]({filename}2026-10-01-django-generic-listview.md) (this post)
> * [`DetailView`]({filename}2026-10-02-django-generic-detailview.md)

---

For the purposes of this post, we're going to assume a single model:

```python
class Post(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True)
    is_featured = models.BooleanField(default=False)
```

We'll cover the following attributes, if you want to jump straight to each section:

* [`template_name`](#template-name)
* [`context_object_name`](#context-object-name)
* [`ordering`](#ordering)
* [`queryset`](#queryset)
* [`get_queryset()`](#get-queryset)
* [`paginate_by`](#paginate-by)
* [`extra_context`](#extra-context)
* [`get_context_data()`](#get-context-data)

## The Simple `ListView`

At its most basic, Django's `ListView` will render a template with a list of instances of a particular model. Just two lines (beyond the import) is enough to get this functionality:

```python
from django.views.generic import ListView

class PostList(ListView):
    model = Post
```

A template named `post_list.html` is expected, and it will be handed a variable named `object_list` which is a `QuerySet` of all `Post` instances.

### But my template is called `all_posts.html`! {#template-name}

Then update the template name that `ListView` looks for:

```python hl_lines="3"
class PostList(ListView):
    model = Post
    template_name = "all_posts.html"
```

### In my template, I use `posts` not `object_list`! {#context-object-name}

You can change the template variable name that `ListView` sets:

```python hl_lines="4"
class PostList(ListView):
    model = Post
    template_name = "all_posts.html"
    context_object_name = "posts"
```

Without this, the list is available as either `object_list` or `post_list` (the second derived from the model name).

### I need the posts to appear with the most recent first! {#ordering}

Define what order is used by the `QuerySet`:

```python hl_lines="5"
class PostList(ListView):
    model = Post
    template_name = "all_posts.html"
    context_object_name = "posts"
    ordering = "-published_at"
```

### Posts that aren't published yet are still appearing! {#queryset}

Specify the base `QuerySet` that `ListView` is using:

```python hl_lines="5"
class PostList(ListView):
    template_name = "all_posts.html"
    context_object_name = "posts"
    ordering = "-published_at"
    queryset = Post.objects.exclude(published_at__isnull=True)
```

Notice that we don't need to specify the `model` anymore.

### What if I want to also exclude posts that have been set to publish in the future? {#get-queryset}

You can't do that with a class attribute (fetching the current time requires some runtime code, not compile-time code), but the `ListView` still has you covered:

```python hl_lines="5 6 7"
class PostList(ListView):
    template_name = "all_posts.html"
    context_object_name = "posts"
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now).order_by("-published_at")
```

Note that providing a `QuerySet` this way will ignore both the `queryset` and `ordering` attributes mentioned above, which is why we've included the ordering directly in the `get_queryset` method now. You can call `super().get_queryset()` if you want to use those attributes and just adjust the query set after, though.

### Too many posts are showing up! I only want ten. {#paginate-by}

Add pagination:

```python hl_lines="4"
class PostList(ListView):
    template_name = "all_posts.html"
    context_object_name = "posts"
    paginate_by = 10
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now).order_by("-published_at")
```

The [Pagination docs](https://docs.djangoproject.com/en/6.1/topics/pagination/#paginating-a-listview) are a great place to see what's required in the template.

### I need extra data in the template. {#extra-context}

This is not limited to the `ListView`, but most generic class-based views allow the passing of extra data to the template:

```python hl_lines="5"
class PostList(ListView):
    template_name = "all_posts.html"
    context_object_name = "posts"
    paginate_by = 10
    extra_context = {"section": "blog"}
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now).order_by("-published_at")
```

### My extra data isn't static, though. {#get-context-data}

Also not limited to the `ListView`, adding complex extra data to the template context is easy:

```python hl_lines="7 8 9 10 11 12"
class PostList(ListView):
    template_name = "all_posts.html"
    context_object_name = "posts"
    paginate_by = 10
    extra_context = {"section": "blog"}
    
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["featured_posts"] = Post.objects.filter(
            is_featured=true
        ).order_by("-published_at")[:5]
        return context
    
    def get_queryset(self):
        now = timezone.now()
        return Post.objects.filter(published_at__lte=now).order_by("-published_at")
```

---

This may become a series of posts working through the different generic class-based views that Django provides, but I will make no promises! For now, this should suffice as a quick reference for those wanting to easily customise the behaviour of `ListView` without reinventing the wheel.
