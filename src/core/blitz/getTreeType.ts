import { TreeType } from '../../components/Tanks';
import { tankDefinitions } from '../blitzkrieg/tankDefinitions';

export default async function getTreeType(id: number): Promise<TreeType> {
  const entry = (await tankDefinitions)[id];

  if (entry.treeType === 'collector') return 'collector';
  if (entry.treeType === 'premium') return 'premium';

  return 'researchable';
}
