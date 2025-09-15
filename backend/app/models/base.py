from app.core.database import Base

# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.artifact import Artifact, ArtifactType, AnchorMode
from app.models.report import Report
from app.models.analytics import AnalyticsEvent
