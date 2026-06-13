"""
Django management script to generate fake data for Kwork Clone application.
This script creates realistic sample data for development and testing purposes.

Usage: python manage.py shell < generate_fake_data.py
Or: python generate_fake_data.py
"""

import os
import django
import random
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Run migrations first
from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

print("Checking and applying migrations...")
executor = MigrationExecutor(connection)
plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
if plan:
    print(f"Applying {len(plan)} pending migrations...")
    call_command('migrate', verbosity=1)
else:
    print("✓ All migrations already applied")

from faker import Faker
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import SellerProfile, EmailVerification, SellerStatus
from apps.catalog.models import Category
from apps.kworks.models import Kwork, KworkStatus
from apps.orders.models import Order, OrderMessage, Delivery, OrderStatus

User = get_user_model()
fake = Faker(['en_US', 'fr_FR', 'de_DE', 'es_ES'])

# Configuration
NUM_USERS = 100
NUM_SELLERS = 40
NUM_CATEGORIES = 25
NUM_KWORKS = 200
NUM_ORDERS = 150


def clear_data():
    """Clear existing data to avoid conflicts."""
    print("Clearing existing data...")
    try:
        Order.objects.all().delete()
        Kwork.objects.all().delete()
        SellerProfile.objects.all().delete()
        Category.objects.all().delete()
        EmailVerification.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        print("✓ Data cleared")
    except Exception as e:
        print(f"⚠ Some tables may not exist yet: {str(e)}")
        print("Continuing with data generation...")


def generate_users():
    """Generate regular users and sellers."""
    print(f"\n📝 Generating {NUM_USERS} users...")

    users = []
    seller_indices = set(random.sample(range(NUM_USERS), NUM_SELLERS))

    for i in range(NUM_USERS):
        is_seller = i in seller_indices
        username = fake.user_name()

        # Ensure unique username
        counter = 0
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}_{counter}"
            counter += 1

        # Create user
        user = User.objects.create_user(
            username=username,
            email=fake.unique.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            phone=fake.numerify(text='###-###-####'),
            city=fake.city(),
            is_seller=is_seller,
            is_active=True,
            email_verified_at=timezone.now() if random.random() > 0.3 else None,
        )

        users.append(user)

        # Create email verification record for unverified users
        if user.email_verified_at is None and random.random() > 0.5:
            EmailVerification.objects.create(
                user=user,
                token=fake.sha256(),
                expires_at=timezone.now() + timedelta(hours=24),
            )

    print(f"✓ Created {NUM_USERS} users ({NUM_SELLERS} sellers)")
    return users


def generate_seller_profiles(users):
    """Generate seller profiles."""
    print(f"\n👔 Generating seller profiles...")

    sellers = [u for u in users if u.is_seller]

    for seller in sellers:
        rating = Decimal(random.uniform(1.0, 5.0)).quantize(Decimal('0.01'))

        SellerProfile.objects.create(
            user=seller,
            display_name=f"{seller.first_name} {seller.last_name}",
            bio=fake.text(max_nb_chars=500),
            status=random.choice([SellerStatus.ACTIVE, SellerStatus.ACTIVE, SellerStatus.ACTIVE, SellerStatus.INACTIVE]),
            rating=rating,
            completed_orders=random.randint(5, 500),
        )

    print(f"✓ Created {len(sellers)} seller profiles")


def generate_categories():
    """Generate category hierarchy."""
    print(f"\n📂 Generating {NUM_CATEGORIES} categories...")

    categories_data = [
        ("Programming & IT", [
            "Web Development",
            "Mobile Development",
            "Desktop Software",
            "Data Science",
            "DevOps & System Admin",
            "Database Design",
            "API Development",
        ]),
        ("Design", [
            "Logo Design",
            "UI/UX Design",
            "Graphic Design",
            "3D Design",
            "Brand Design",
        ]),
        ("Writing", [
            "Content Writing",
            "Copywriting",
            "Technical Writing",
            "Translation",
            "Proofreading",
        ]),
        ("Marketing", [
            "Social Media Marketing",
            "SEO Optimization",
            "Email Marketing",
            "Advertising",
            "Analytics",
        ]),
        ("Video & Animation", [
            "Video Editing",
            "Animation",
            "Motion Graphics",
            "Video Production",
        ]),
        ("Business", [
            "Business Consulting",
            "Virtual Assistant",
            "Project Management",
            "Financial Planning",
        ]),
    ]

    categories = []
    category_map = {}

    # Create parent categories
    for parent_name, _ in categories_data:
        category = Category.objects.create(
            name=parent_name,
            slug=parent_name.lower().replace(" ", "-"),
            is_active=True,
            sort_order=len(categories),
        )
        categories.append(category)
        category_map[parent_name] = category

    # Create child categories
    for parent_name, children in categories_data:
        parent = category_map[parent_name]
        for i, child_name in enumerate(children):
            child = Category.objects.create(
                parent=parent,
                name=child_name,
                slug=f"{parent_name.lower().replace(' ', '-')}-{child_name.lower().replace(' ', '-')}",
                is_active=True,
                sort_order=i,
            )
            categories.append(child)

    print(f"✓ Created {len(categories)} categories")
    return categories


def generate_kworks(users, categories):
    """Generate kworks (services)."""
    print(f"\n💼 Generating {NUM_KWORKS} kworks...")

    sellers = [u for u in users if u.is_seller]
    kwork_titles = [
        "Build responsive website",
        "Design modern logo",
        "Write professional content",
        "Create mobile app",
        "Design UI mockups",
        "Develop REST API",
        "Write technical documentation",
        "Create marketing strategy",
        "Edit your video",
        "Translate documents",
        "Develop e-commerce website",
        "Create 3D models",
        "Build chatbot",
        "Design landing page",
        "Develop machine learning model",
        "Create WordPress website",
        "Design social media posts",
        "Write blog articles",
        "Develop Python scripts",
        "Create product mockups",
    ]

    kworks = []

    for i in range(NUM_KWORKS):
        seller = random.choice(sellers)
        category = random.choice(categories)
        title_template = random.choice(kwork_titles)
        title = f"{title_template} - {fake.word()}"[:180]
        slug = f"{title.lower().replace(' ', '-')}-{fake.numerify('####')}"[:220]

        # Ensure unique slug per seller
        counter = 0
        original_slug = slug
        while Kwork.objects.filter(seller=seller, slug=slug).exists():
            slug = f"{original_slug}-{counter}"[:220]
            counter += 1

        kwork = Kwork.objects.create(
            seller=seller,
            category=category,
            title=title,
            slug=slug,
            description=fake.text(max_nb_chars=1500),
            price_minor=Decimal(random.choice([25, 50, 75, 100, 150, 200, 300, 500, 750, 1000])),
            currency=random.choice(['USD', 'UZS']),
            delivery_days=random.randint(1, 30),
            status=random.choice([KworkStatus.ACTIVE, KworkStatus.ACTIVE, KworkStatus.ACTIVE, KworkStatus.DRAFT, KworkStatus.PAUSED]),
        )
        kworks.append(kwork)

    print(f"✓ Created {NUM_KWORKS} kworks")
    return kworks


def generate_orders(users, kworks):
    """Generate orders."""
    print(f"\n📦 Generating {NUM_ORDERS} orders...")

    buyers = [u for u in users if not u.is_superuser]
    orders = []

    for i in range(NUM_ORDERS):
        kwork = random.choice(kworks)
        buyer = random.choice(buyers)

        # Ensure buyer is not seller
        while buyer == kwork.seller:
            buyer = random.choice(buyers)

        order = Order.objects.create(
            buyer=buyer,
            seller=kwork.seller,
            kwork=kwork,
            title_snapshot=kwork.title,
            price_minor=int(kwork.price_minor * 100),  # Convert to cents
            currency=kwork.currency,
            requirements=fake.text(max_nb_chars=500) if random.random() > 0.4 else "",
            status=random.choice([
                OrderStatus.NEW,
                OrderStatus.IN_PROGRESS,
                OrderStatus.IN_PROGRESS,
                OrderStatus.DELIVERED,
                OrderStatus.COMPLETED,
                OrderStatus.COMPLETED,
            ]),
        )
        orders.append(order)

    print(f"✓ Created {NUM_ORDERS} orders")
    return orders


def generate_order_messages(users, orders):
    """Generate order messages."""
    print(f"\n💬 Generating order messages...")

    message_count = 0

    for order in orders:
        # Only add messages to orders that are in progress or later
        if order.status in [OrderStatus.IN_PROGRESS, OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELED]:
            num_messages = random.randint(1, 8)

            for _ in range(num_messages):
                sender = random.choice([order.buyer, order.seller])

                OrderMessage.objects.create(
                    order=order,
                    sender=sender,
                    body=fake.sentence(nb_words=random.randint(5, 50)),
                )
                message_count += 1

    print(f"✓ Created {message_count} order messages")


def generate_deliveries(orders):
    """Generate deliveries."""
    print(f"\n📮 Generating deliveries...")

    delivery_count = 0

    for order in orders:
        # Only add deliveries to orders that are delivered or completed
        if order.status in [OrderStatus.DELIVERED, OrderStatus.COMPLETED]:
            num_deliveries = random.randint(1, 3)

            for _ in range(num_deliveries):
                Delivery.objects.create(
                    order=order,
                    message=fake.text(max_nb_chars=500),
                )
                delivery_count += 1

    print(f"✓ Created {delivery_count} deliveries")


def print_summary(users, categories, kworks, orders):
    """Print generation summary."""
    print("\n" + "="*60)
    print("📊 DATA GENERATION SUMMARY")
    print("="*60)
    print(f"✓ Total Users:           {users.count()}")
    print(f"✓ Total Sellers:         {users.filter(is_seller=True).count()}")
    print(f"✓ Total Categories:      {categories.count()}")
    print(f"✓ Total Kworks:          {kworks.count()}")
    print(f"✓ Total Orders:          {orders.count()}")
    print(f"✓ Total Order Messages:  {OrderMessage.objects.count()}")
    print(f"✓ Total Deliveries:      {Delivery.objects.count()}")
    print(f"✓ Total Email Verifications: {EmailVerification.objects.count()}")
    print("="*60)
    print("✅ Fake data generation completed successfully!")
    print("="*60 + "\n")


def main():
    """Main function to generate all fake data."""
    try:
        print("\n" + "="*60)
        print("🚀 KWORK CLONE - FAKE DATA GENERATOR")
        print("="*60)

        # Clear existing data
        clear_data()

        # Generate all data
        users = generate_users()
        generate_seller_profiles(users)
        categories = generate_categories()
        kworks = generate_kworks(users, categories)
        orders = generate_orders(users, kworks)
        generate_order_messages(users, orders)
        generate_deliveries(orders)

        # Print summary
        users_qs = User.objects.filter(is_superuser=False)
        categories_qs = Category.objects.all()
        kworks_qs = Kwork.objects.all()
        orders_qs = Order.objects.all()

        print_summary(users_qs, categories_qs, kworks_qs, orders_qs)

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        raise


if __name__ == "__main__":
    main()
