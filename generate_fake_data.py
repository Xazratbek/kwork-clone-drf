"""
Kwork Clone — demo ma'lumot generatori.

Ishlatish:
    python generate_fake_data.py
    python manage.py shell < generate_fake_data.py
"""

import os
import random
import secrets
from datetime import timedelta
from decimal import Decimal

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone
from faker import Faker

from apps.accounts.models import EmailVerification, SellerProfile, SellerStatus
from apps.catalog.models import Category
from apps.exchange.models import Project, ProjectBid
from apps.kworks.models import Favorite, Kwork, KworkFAQ, KworkStatus
from apps.notifications.models import DeviceToken, Notification, NotificationPreference
from apps.offers.models import CustomOffer
from apps.orders.models import (
    Delivery,
    Order,
    OrderEvent,
    OrderMessage,
    OrderRequirement,
    OrderStatus,
    RevisionRequest,
)
from apps.payments.models import Escrow, Payment
from apps.reviews.models import Review
from apps.wallets.models import (
    Dispute,
    DisputeMessage,
    RefundRequest,
    Wallet,
    WalletTransaction,
    WithdrawalRequest,
)

User = get_user_model()
fake = Faker(["en_US", "uz_UZ", "ru_RU"])

NUM_USERS = 100
NUM_SELLERS = 40
NUM_KWORKS = 200
NUM_ORDERS = 150
NUM_FAVORITES = 100
NUM_OFFERS = 40
NUM_PROJECTS = 25


def ensure_migrations():
    print("Checking and applying migrations...")
    executor = MigrationExecutor(connection)
    plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
    if plan:
        print(f"Applying {len(plan)} pending migrations...")
        call_command("migrate", verbosity=1)
    else:
        print("✓ All migrations already applied")


def clear_data():
    print("Clearing existing data...")
    models_in_order = [
        DisputeMessage,
        Dispute,
        RefundRequest,
        WithdrawalRequest,
        WalletTransaction,
        Escrow,
        Payment,
        Review,
        Notification,
        DeviceToken,
        NotificationPreference,
        RevisionRequest,
        OrderRequirement,
        OrderEvent,
        OrderMessage,
        Delivery,
        Order,
        Favorite,
        KworkFAQ,
        Kwork,
        CustomOffer,
        ProjectBid,
        Project,
        SellerProfile,
        EmailVerification,
    ]
    for model in models_in_order:
        model.objects.all().delete()
    Wallet.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    Category.objects.all().delete()
    print("✓ Data cleared")


def unique_username():
    username = fake.user_name()
    counter = 0
    base = username
    while User.objects.filter(username=username).exists():
        username = f"{base}_{counter}"
        counter += 1
    return username


def generate_users():
    print(f"\n📝 Generating {NUM_USERS} users...")
    users = []
    seller_indices = set(random.sample(range(NUM_USERS), NUM_SELLERS))

    for i in range(NUM_USERS):
        is_seller = i in seller_indices
        user = User.objects.create_user(
            username=unique_username(),
            email=fake.unique.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            phone=fake.numerify(text="##########"),
            city=fake.city(),
            is_seller=is_seller,
            is_active=True,
            email_verified_at=timezone.now() if random.random() > 0.25 else None,
        )
        users.append(user)

        Wallet.objects.create(
            user=user,
            balance=Decimal(random.randint(0, 5000)),
            escrow_balance=Decimal(0),
        )
        NotificationPreference.objects.create(user=user)

        if user.email_verified_at is None and random.random() > 0.5:
            EmailVerification.objects.create(
                user=user,
                token=secrets.token_hex(32),
                expires_at=timezone.now() + timedelta(hours=24),
            )

    print(f"✓ Created {len(users)} users ({NUM_SELLERS} sellers)")
    return users


def generate_seller_profiles(users):
    print("\n👔 Generating seller profiles...")
    sellers = [u for u in users if u.is_seller]
    for seller in sellers:
        SellerProfile.objects.create(
            user=seller,
            display_name=f"{seller.first_name} {seller.last_name}",
            bio=fake.text(max_nb_chars=500),
            status=random.choice([SellerStatus.ACTIVE, SellerStatus.ACTIVE, SellerStatus.INACTIVE]),
            rating=Decimal(str(round(random.uniform(3.5, 5.0), 2))),
            completed_orders=random.randint(0, 200),
        )
    print(f"✓ Created {len(sellers)} seller profiles")


def generate_categories():
    print("\n📂 Generating categories...")
    categories_data = [
        ("Programming & IT", ["Web Development", "Mobile Development", "API Development", "DevOps"]),
        ("Design", ["Logo Design", "UI/UX Design", "Graphic Design", "Brand Design"]),
        ("Writing", ["Content Writing", "Copywriting", "Translation", "Proofreading"]),
        ("Marketing", ["Social Media", "SEO", "Email Marketing", "Analytics"]),
        ("Video & Animation", ["Video Editing", "Animation", "Motion Graphics"]),
        ("Business", ["Consulting", "Virtual Assistant", "Project Management"]),
    ]

    categories = []
    for parent_idx, (parent_name, children) in enumerate(categories_data):
        parent = Category.objects.create(
            name=parent_name,
            slug=parent_name.lower().replace(" & ", "-").replace(" ", "-"),
            is_active=True,
            sort_order=parent_idx,
        )
        categories.append(parent)
        for child_idx, child_name in enumerate(children):
            child = Category.objects.create(
                parent=parent,
                name=child_name,
                slug=f"{parent.slug}-{child_name.lower().replace(' ', '-')}",
                is_active=True,
                sort_order=child_idx,
            )
            categories.append(child)

    print(f"✓ Created {len(categories)} categories")
    return categories


def generate_kworks(users, categories):
    print(f"\n💼 Generating {NUM_KWORKS} kworks...")
    sellers = [u for u in users if u.is_seller]
    titles = [
        "Build responsive website",
        "Design modern logo",
        "Write professional content",
        "Develop mobile app",
        "Create REST API",
        "SEO optimization package",
        "Video editing service",
        "Social media design pack",
    ]

    kworks = []
    for _ in range(NUM_KWORKS):
        seller = random.choice(sellers)
        title = f"{random.choice(titles)} — {fake.word()}"[:180]
        slug_base = title.lower().replace(" ", "-").replace("—", "")[:200]
        slug = slug_base
        counter = 0
        while Kwork.objects.filter(seller=seller, slug=slug).exists():
            slug = f"{slug_base}-{counter}"[:220]
            counter += 1

        kwork = Kwork.objects.create(
            seller=seller,
            category=random.choice(categories),
            title=title,
            slug=slug,
            description=fake.text(max_nb_chars=1200),
            price_minor=Decimal(random.choice([25, 50, 75, 100, 150, 200, 300, 500])),
            currency=random.choice(["USD", "UZS"]),
            delivery_days=random.randint(1, 21),
            status=random.choices(
                [KworkStatus.ACTIVE, KworkStatus.DRAFT, KworkStatus.PAUSED],
                weights=[7, 2, 1],
            )[0],
        )
        kworks.append(kwork)

        for sort_order in range(random.randint(1, 3)):
            KworkFAQ.objects.create(
                kwork=kwork,
                question=fake.sentence(nb_words=8) + "?",
                answer=fake.paragraph(nb_sentences=3),
                sort_order=sort_order,
            )

    print(f"✓ Created {len(kworks)} kworks with FAQs")
    return kworks


def generate_favorites(users, kworks):
    print("\n⭐ Generating favorites...")
    active_kworks = [k for k in kworks if k.status == KworkStatus.ACTIVE]
    if not active_kworks:
        active_kworks = kworks

    created = 0
    seen = set()
    for _ in range(NUM_FAVORITES):
        user = random.choice(users)
        kwork = random.choice(active_kworks)
        key = (user.pk, kwork.pk)
        if key in seen:
            continue
        seen.add(key)
        Favorite.objects.create(user=user, kwork=kwork)
        created += 1

    print(f"✓ Created {created} favorites")


def generate_orders(users, kworks):
    print(f"\n📦 Generating {NUM_ORDERS} orders...")
    buyers = [u for u in users if not u.is_superuser]
    active_kworks = [k for k in kworks if k.status == KworkStatus.ACTIVE] or kworks
    orders = []

    for _ in range(NUM_ORDERS):
        kwork = random.choice(active_kworks)
        buyer = random.choice(buyers)
        while buyer == kwork.seller:
            buyer = random.choice(buyers)

        status = random.choices(
            [
                OrderStatus.NEW,
                OrderStatus.IN_PROGRESS,
                OrderStatus.DELIVERED,
                OrderStatus.COMPLETED,
                OrderStatus.CANCELED,
                OrderStatus.REJECTED,
            ],
            weights=[2, 3, 2, 4, 1, 1],
        )[0]

        order = Order.objects.create(
            buyer=buyer,
            seller=kwork.seller,
            kwork=kwork,
            title_snapshot=kwork.title,
            price_minor=kwork.price_minor,
            currency=kwork.currency,
            requirements=fake.text(max_nb_chars=400) if random.random() > 0.35 else "",
            status=status,
        )
        orders.append(order)

        OrderEvent.objects.create(
            order=order,
            event_type=OrderEvent.EventType.CREATED,
            actor=buyer,
            description="Order created",
        )

        if random.random() > 0.4:
            OrderRequirement.objects.create(
                order=order,
                question="What is your brand color palette?",
                answer_text=fake.sentence() if random.random() > 0.3 else "",
            )

    print(f"✓ Created {len(orders)} orders")
    return orders


def generate_order_messages(orders):
    print("\n💬 Generating order messages...")
    count = 0
    for order in orders:
        if order.status in {
            OrderStatus.IN_PROGRESS,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
        }:
            for _ in range(random.randint(2, 6)):
                sender = random.choice([order.buyer, order.seller])
                receiver = order.seller if sender == order.buyer else order.buyer
                OrderMessage.objects.create(
                    order=order,
                    sender=sender,
                    receiver=receiver,
                    body=fake.sentence(nb_words=random.randint(6, 20)),
                )
                count += 1
    print(f"✓ Created {count} order messages")


def generate_deliveries_and_revisions(orders):
    print("\n📮 Generating deliveries and revisions...")
    delivery_count = 0
    revision_count = 0

    for order in orders:
        if order.status in {OrderStatus.DELIVERED, OrderStatus.COMPLETED}:
            delivery = Delivery.objects.create(
                order=order,
                message=fake.text(max_nb_chars=400),
            )
            delivery_count += 1

            if order.status == OrderStatus.DELIVERED and random.random() > 0.7:
                RevisionRequest.objects.create(
                    order=order,
                    delivery=delivery,
                    buyer=order.buyer,
                    reason=fake.sentence(nb_words=12),
                    status="open",
                )
                revision_count += 1

    print(f"✓ Created {delivery_count} deliveries, {revision_count} revision requests")


def generate_payments_and_escrow(orders):
    print("\n💳 Generating payments and escrow...")
    payment_count = 0
    escrow_count = 0

    paid_statuses = {
        OrderStatus.IN_PROGRESS,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
    }

    for order in orders:
        if order.status not in paid_statuses:
            continue

        payment_status = "completed" if random.random() > 0.1 else "failed"
        Payment.objects.create(
            order=order,
            amount=order.price_minor,
            provider=random.choice(["mock", "click", "payme"]),
            status=payment_status,
            transaction_id=f"txn_{secrets.token_hex(8)}",
            provider_response={"sandbox": True, "status": payment_status},
        )
        payment_count += 1

        if payment_status != "completed":
            continue

        escrow_status = "held"
        released_at = None
        if order.status == OrderStatus.COMPLETED:
            escrow_status = "released"
            released_at = timezone.now() - timedelta(days=random.randint(1, 10))

        Escrow.objects.create(
            order=order,
            amount=order.price_minor,
            status=escrow_status,
            released_at=released_at,
        )
        escrow_count += 1

        OrderEvent.objects.create(
            order=order,
            event_type=OrderEvent.EventType.PAID,
            actor=order.buyer,
            description="Payment completed (sandbox)",
        )

    print(f"✓ Created {payment_count} payments, {escrow_count} escrows")


def generate_wallets_data(orders):
    print("\n👛 Generating wallet transactions and withdrawals...")
    tx_count = 0
    withdrawal_count = 0

    for order in [o for o in orders if o.status == OrderStatus.COMPLETED]:
        seller_wallet, _ = Wallet.objects.get_or_create(user=order.seller)
        amount = order.price_minor
        seller_wallet.balance += amount
        seller_wallet.save(update_fields=["balance", "updated_at"])

        WalletTransaction.objects.create(
            wallet=seller_wallet,
            order=order,
            amount=amount,
            type="payment_received",
            description=f"Earnings from order {order.pk}",
            reference_id=str(order.pk),
        )
        tx_count += 1

    sellers = User.objects.filter(is_seller=True, is_superuser=False)
    for seller in sellers:
        if random.random() > 0.6:
            continue
        wallet = seller.wallet
        if wallet.balance < Decimal("50"):
            continue
        amount = Decimal(random.randint(50, min(int(wallet.balance), 500)))
        WithdrawalRequest.objects.create(
            user=seller,
            amount=amount,
            method=random.choice(["bank_transfer", "payme", "click"]),
            status=random.choice(["pending", "approved", "completed"]),
            bank_account=fake.bban() if random.random() > 0.5 else None,
            phone_number=fake.numerify(text="998#########"),
        )
        withdrawal_count += 1

    print(f"✓ Created {tx_count} wallet transactions, {withdrawal_count} withdrawal requests")


def generate_reviews(orders):
    print("\n⭐ Generating reviews...")
    count = 0
    for order in [o for o in orders if o.status == OrderStatus.COMPLETED]:
        if random.random() > 0.35:
            continue
        Review.objects.create(
            order=order,
            buyer=order.buyer,
            seller=order.seller,
            rating=random.randint(3, 5),
            comment=fake.paragraph(nb_sentences=2),
        )
        count += 1
    print(f"✓ Created {count} reviews")


def generate_disputes_and_refunds(orders):
    print("\n⚖️ Generating disputes and refund requests...")
    dispute_count = 0
    refund_count = 0

    candidates = [o for o in orders if o.status in {OrderStatus.DELIVERED, OrderStatus.CANCELED}]
    for order in candidates:
        if random.random() > 0.92:
            opened_by = random.choice([order.buyer, order.seller])
            dispute = Dispute.objects.create(
                order=order,
                opened_by=opened_by,
                reason=fake.paragraph(nb_sentences=2),
                status=random.choice(["open", "in_progress", "resolved"]),
            )
            dispute_count += 1
            other = order.seller if opened_by == order.buyer else order.buyer
            for _ in range(random.randint(1, 3)):
                DisputeMessage.objects.create(
                    dispute=dispute,
                    sender=random.choice([opened_by, other]),
                    body=fake.sentence(nb_words=15),
                )

        if order.status == OrderStatus.CANCELED and random.random() > 0.85:
            RefundRequest.objects.create(
                order=order,
                reason=fake.sentence(nb_words=12),
                status=random.choice(["pending", "approved", "completed"]),
            )
            refund_count += 1

    print(f"✓ Created {dispute_count} disputes, {refund_count} refund requests")


def generate_notifications(users, orders):
    print("\n🔔 Generating notifications...")
    count = 0
    notification_types = [
        "order_update",
        "payment_confirmation",
        "message",
        "review_request",
        "system",
    ]

    for user in users:
        for _ in range(random.randint(2, 8)):
            order = random.choice(orders) if orders and random.random() > 0.4 else None
            Notification.objects.create(
                user=user,
                title=fake.sentence(nb_words=5),
                body=fake.sentence(nb_words=12),
                type=random.choice(notification_types),
                is_read=random.random() > 0.55,
                related_order_id=None,
                read_at=timezone.now() if random.random() > 0.5 else None,
            )
            count += 1

        if random.random() > 0.7:
            DeviceToken.objects.create(
                user=user,
                token=f"fcm_{secrets.token_hex(24)}",
                platform=random.choice(["ios", "android", "web"]),
                is_active=True,
            )

    print(f"✓ Created {count} notifications")


def generate_offers(users):
    print("\n🤝 Generating custom offers...")
    sellers = [u for u in users if u.is_seller]
    buyers = [u for u in users if not u.is_seller]
    if not sellers or not buyers:
        print("⚠ Skipping offers — not enough sellers/buyers")
        return

    count = 0
    for _ in range(NUM_OFFERS):
        seller = random.choice(sellers)
        buyer = random.choice(buyers)
        CustomOffer.objects.create(
            seller=seller,
            buyer=buyer,
            title=fake.sentence(nb_words=4),
            description=fake.text(max_nb_chars=500),
            price=Decimal(random.randint(30, 800)),
            delivery_days=random.randint(2, 14),
            status=random.choice(["pending", "accepted", "rejected", "expired"]),
            expires_at=timezone.now() + timedelta(days=random.randint(1, 7)),
        )
        count += 1
    print(f"✓ Created {count} custom offers")


def generate_exchange(users):
    print("\n📋 Generating projects and bids...")
    buyers = [u for u in users if not u.is_seller]
    sellers = [u for u in users if u.is_seller]
    if not buyers or not sellers:
        print("⚠ Skipping exchange — not enough users")
        return

    project_count = 0
    bid_count = 0

    for _ in range(NUM_PROJECTS):
        buyer = random.choice(buyers)
        project = Project.objects.create(
            buyer=buyer,
            title=fake.sentence(nb_words=5),
            description=fake.text(max_nb_chars=600),
            budget=Decimal(random.randint(100, 3000)),
            deadline=timezone.now() + timedelta(days=random.randint(7, 45)),
            status=random.choice(["open", "in_progress", "completed", "canceled"]),
        )
        project_count += 1

        bid_sellers = random.sample(sellers, k=min(len(sellers), random.randint(1, 5)))
        for seller in bid_sellers:
            ProjectBid.objects.create(
                project=project,
                seller=seller,
            amount=Decimal(str(round(float(project.budget) * random.uniform(0.7, 1.1), 2))),
                message=fake.paragraph(nb_sentences=2),
                delivery_days=random.randint(3, 21),
                status=random.choice(["pending", "accepted", "rejected", "withdrawn"]),
            )
            bid_count += 1

    print(f"✓ Created {project_count} projects, {bid_count} bids")


def print_summary():
    print("\n" + "=" * 60)
    print("📊 DATA GENERATION SUMMARY")
    print("=" * 60)
    print(f"Users:                 {User.objects.filter(is_superuser=False).count()}")
    print(f"Sellers:               {User.objects.filter(is_seller=True, is_superuser=False).count()}")
    print(f"Categories:            {Category.objects.count()}")
    print(f"Kworks:                {Kwork.objects.count()}")
    print(f"Kwork FAQs:            {KworkFAQ.objects.count()}")
    print(f"Favorites:             {Favorite.objects.count()}")
    print(f"Orders:                {Order.objects.count()}")
    print(f"Order messages:        {OrderMessage.objects.count()}")
    print(f"Deliveries:            {Delivery.objects.count()}")
    print(f"Payments:              {Payment.objects.count()}")
    print(f"Escrows:               {Escrow.objects.count()}")
    print(f"Wallets:               {Wallet.objects.count()}")
    print(f"Wallet transactions:   {WalletTransaction.objects.count()}")
    print(f"Withdrawal requests:   {WithdrawalRequest.objects.count()}")
    print(f"Reviews:               {Review.objects.count()}")
    print(f"Disputes:              {Dispute.objects.count()}")
    print(f"Refund requests:       {RefundRequest.objects.count()}")
    print(f"Notifications:         {Notification.objects.count()}")
    print(f"Custom offers:         {CustomOffer.objects.count()}")
    print(f"Projects:              {Project.objects.count()}")
    print(f"Project bids:          {ProjectBid.objects.count()}")
    print("=" * 60)
    print("✅ Fake data generation completed successfully!")
    print("=" * 60 + "\n")


def main():
    print("\n" + "=" * 60)
    print("🚀 KWORK CLONE — FAKE DATA GENERATOR")
    print("=" * 60)

    ensure_migrations()
    clear_data()

    users = generate_users()
    generate_seller_profiles(users)
    categories = generate_categories()
    kworks = generate_kworks(users, categories)
    generate_favorites(users, kworks)
    orders = generate_orders(users, kworks)
    generate_order_messages(orders)
    generate_deliveries_and_revisions(orders)
    generate_payments_and_escrow(orders)
    generate_wallets_data(orders)
    generate_reviews(orders)
    generate_disputes_and_refunds(orders)
    generate_notifications(users, orders)
    generate_offers(users)
    generate_exchange(users)

    print_summary()


if __name__ == "__main__":
    main()
