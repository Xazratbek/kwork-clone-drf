from .models import OrderMessage

def send_message(order, sender, msg):

    receiver = order.buyer if sender == order.seller else order.seller
    
    order_message = OrderMessage(
        order = order, sender = sender, receiver = receiver, body = msg
    )
    order_message.save()
    return order_message