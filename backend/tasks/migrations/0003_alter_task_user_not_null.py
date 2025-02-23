from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

def delete_tasks_without_user(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    Task.objects.filter(user__isnull=True).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('tasks', '0002_task_user'),
    ]

    operations = [
        migrations.RunPython(delete_tasks_without_user),
        migrations.AlterField(
            model_name='task',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tasks',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ] 