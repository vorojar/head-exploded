#!/usr/bin/env python3
"""Atomically switch head-exploded to its previous release; keep all assets."""
import subprocess
subprocess.run(['ssh','xiaomi-server',"python -c 'from pathlib import Path; import os; b=Path.home()/\"server/apps/head-exploded\"; p=b/\"previous\"; c=b/\"current\"; assert p.is_symlink() and p.resolve().is_dir(), \"No previous release\"; t=b/\"rollback.pending\"; t.symlink_to(os.readlink(p)); os.replace(t,c); print(c.resolve())'"],check=True)
