from .models import OrderMessage

def send_message(order, sender, msg):
    order_message = OrderMessage(
        order = order, sender = sender, body = msg
    )
    return order_message