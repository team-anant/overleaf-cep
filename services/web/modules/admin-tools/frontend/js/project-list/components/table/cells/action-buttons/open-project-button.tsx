import { memo, useCallback } from 'react'
import { Project } from '../../../../../../../types/project/api'
import OLTooltip from '@/shared/components/ol/ol-tooltip'
import OLIconButton from '@/shared/components/ol/ol-icon-button'

type OpenProjectButtonProps = {
  project: Project
  children: (text: string, openProject: () => void) => React.ReactElement
}

function OpenProjectButton({ project, children }: OpenProjectButtonProps) {
  if (project.deleted) return null

  const text = 'Open project'

  const openProject = useCallback(() => {
    window.open(`/project/${project.id}`, '_blank')
  }, [project])

  return children(text, openProject)
}

const OpenProjectButtonTooltip = memo(function OpenProjectButtonTooltip({
  project,
}: Pick<OpenProjectButtonProps, 'project'>) {
  return (
    <OpenProjectButton project={project}>
      {(text, openProject) => (
        <OLTooltip
          key={`tooltip-open-project-${project.id}`}
          id={`open-project-${project.id}`}
          description={text}
          overlayProps={{ placement: 'top', trigger: ['hover', 'focus'] }}
        >
          <OLIconButton
            onClick={openProject}
            variant="link"
            accessibilityLabel={text}
            className="action-btn"
            icon="open_in_new"
          />
        </OLTooltip>
      )}
    </OpenProjectButton>
  )
})

export default memo(OpenProjectButton)
export { OpenProjectButtonTooltip }
