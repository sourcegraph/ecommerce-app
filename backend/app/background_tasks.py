import asyncio
import logging
from sqlmodel import Session

from .db import engine
from .currency_service import CurrencyService
from .settings import FX_TTL_SECONDS

logger = logging.getLogger(__name__)


class BackgroundTasks:
    """Manager for background tasks"""
    
    def __init__(self):
        self._tasks = []
        self._running = False
    
    async def start(self):
        """Start all background tasks"""
        if self._running:
            return
            
        self._running = True
        logger.info("Starting background tasks")
        
        # Start currency rate refresh task
        task = asyncio.create_task(self._currency_refresh_task())
        self._tasks.append(task)
    
    async def stop(self):
        """Stop all background tasks"""
        if not self._running:
            return
            
        self._running = False
        logger.info("Stopping background tasks")
        
        for task in self._tasks:
            task.cancel()
        
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()
    
    async def _currency_refresh_task(self):
        """Background task to refresh currency rates periodically"""
        # Refresh every half TTL to ensure rates are always fresh
        refresh_interval = max(FX_TTL_SECONDS // 2, 300)  # At least 5 minutes
        
        logger.info(f"Starting currency refresh task (interval: {refresh_interval}s)")
        
        while self._running:
            try:
                await asyncio.sleep(refresh_interval)
                
                if not self._running:
                    break
                
                # Refresh rates
                with Session(engine) as session:
                    currency_service = CurrencyService(session)
                    try:
                        currency_service.refresh_rates(force=False)
                        logger.debug("Background currency rate refresh completed")
                    except Exception as e:
                        logger.error(f"Background currency rate refresh failed: {e}")
                        
            except asyncio.CancelledError:
                logger.info("Currency refresh task cancelled")
                break
            except Exception as e:
                logger.error(f"Error in currency refresh task: {e}")
                # Wait before retrying to avoid spam
                await asyncio.sleep(60)


# Global background task manager
background_tasks = BackgroundTasks()
