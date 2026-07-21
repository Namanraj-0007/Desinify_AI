import asyncio
from app.services.code_generation_service import generate_code, optimize_generation

figma_data = {
    'component_tree': {
        'pages': [
            {
                'id': 'page1',
                'name': 'Page 1',
                'width': 1200,
                'height': 800,
                'children': [
                    {
                        'id': 'node1',
                        'name': 'Hero Section',
                        'width': 1200,
                        'height': 420,
                        'children': [
                            {
                                'id': 'cta',
                                'name': 'Primary Button',
                                'width': 140,
                                'height': 48,
                                'children': []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    'design_tokens': {
        'colors': [{'name': 'primary', 'value': '#7c3aed'}],
        'typography': [{'name': 'body', 'font': 'Inter', 'size': 16}],
    },
    'stats': {'nodes': 2}
}

async def test():
    result = await generate_code(
        figma_data,
        project_id='proj1',
        frame_ids=[],
        framework='react',
        use_typescript=True,
        use_tailwind=True,
    )
    print('generate_code files:', len(result['files']))
    print('generate_code stats:', result['stats'])
    optimized = await optimize_generation(
        {
            'files': result['files'],
            'folder_structure': result['folder_structure'],
            'stats': result['stats'],
        },
        improvement_type='tailwind',
        framework='react',
    )
    print('optimize_generation files:', len(optimized['files']))
    print('optimize_generation stats:', optimized['stats'])

asyncio.run(test())
