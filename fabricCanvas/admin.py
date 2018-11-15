from django.contrib import admin
from .models import Template
from django.utils.safestring import mark_safe
# Register your models here.

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("thumbnail_image",)
    fields = ["thumbnail_image", "owner"]
    readonly_fields = ["thumbnail_image",]

    def thumbnail_image(self, obj):
        return mark_safe('<img src="{url}" width="{width}" height={height} /></br>\
                          url: {url}</br>\
                          path: {path}</br>\
                          size: {size}</br>'.format(
            url = obj.thumbnail.url,
            path = obj.thumbnail.path,
            size = obj.thumbnail.size,
            width= 1280 / 4,
            height= 720 / 4,
            )
        )
