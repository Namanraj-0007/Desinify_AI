from setuptools import find_packages, setup

setup(
    packages=find_packages(
        where=".",
        include=["backend", "backend.*"],
        exclude=["frontend", "frontend.*"],
    ),
    package_dir={"": "."},
)
