from pathlib import Path

path = Path('backend/app/services/code_generation_service.py')
text = path.read_text()
start = text.index('def _generate_component_file(')
end = text.index('def _generate_home_page(', start)
replacement = '''def _generate_component_file(
    node: Dict[str, Any],
    comp_type: str,
    use_typescript: bool,
    use_tailwind: bool,
) -> str:
    """Generate a complete React component file from a Figma node."""
    name = _clean_name(_get_node_name(node))
    if not name:
        name = "Component"

    imports = "import { cn } from '@/lib/utils'\n" if use_tailwind else ""
    jsx = _generate_jsx_for_node(node, comp_type)

    if use_typescript:
        file_content = f"""import React from 'react'\n{imports}\ninterface Props {{\n  className?: string\n  children?: React.ReactNode\n}}\n\nexport const {name}: React.FC<Props> = ({{\n  className,\n  children,\n}}) => {{\n  return (\n{jsx}\n  )\n}}\n\nexport default {name}\n"""
    else:
        file_content = f"""import React from 'react'\n{imports}\nexport const {name} = ({{\n  className,\n  children,\n}}) => {{\n  return (\n{jsx}\n  )\n}}\n\nexport default {name}\n"""

    return file_content
'''
path.write_text(text[:start] + replacement + text[end:])
print('patched')
