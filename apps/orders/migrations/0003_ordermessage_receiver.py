import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def populate_receiver(apps, schema_editor):
    OrderMessage = apps.get_model("orders", "OrderMessage")
    for message in OrderMessage.objects.select_related("order").iterator():
        order = message.order
        if message.sender_id == order.buyer_id:
            receiver_id = order.seller_id
        else:
            receiver_id = order.buyer_id
        OrderMessage.objects.filter(pk=message.pk).update(receiver_id=receiver_id)


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_alter_order_price_minor_alter_order_status_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="ordermessage",
            name="receiver",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="received_messages",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(populate_receiver, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="ordermessage",
            name="receiver",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="received_messages",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
