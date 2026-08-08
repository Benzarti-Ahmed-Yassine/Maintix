import os
os.chdir('apps/mlops')
try:
    from maintix_mlops.industrial_pipeline import IndustrialTrainingPipeline
    print('IMPORT_OK')
except Exception as exc:
    import traceback
    traceback.print_exc()
    print('IMPORT_FAILED')
